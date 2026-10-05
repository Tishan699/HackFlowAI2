const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'hackflow_jwt_super_secret_key_2026_secure!';

function resolveUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  const headerUserId = req.headers['x-user-id'];
  const headerUserEmail = req.headers['x-user-email'];
  const headerUserRole = req.headers['x-user-role'];

  // Check custom user headers first (for dev/demo/hybrid flexibility)
  if (headerUserId) {
    const user = db.findById('users', headerUserId);
    if (user) return user;
    if (headerUserEmail || headerUserRole) {
      return {
        id: headerUserId,
        email: headerUserEmail || 'user@hackflow.dev',
        name: req.headers['x-user-name'] || 'HackFlow User',
        role: headerUserRole || 'participant',
        organization: req.headers['x-user-org'] || 'HackFlow Community'
      };
    }
  }
  if (headerUserEmail) {
    const user = db.findOne('users', u => u.email.toLowerCase() === headerUserEmail.toLowerCase());
    if (user) return user;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  // Demo tokens
  if (token.startsWith('token_') || token === 'demo-token') {
    if (headerUserEmail) {
      const user = db.findOne('users', u => u.email.toLowerCase() === headerUserEmail.toLowerCase());
      if (user) return user;
    }
    return {
      id: 'u_organizer',
      name: 'John Doe',
      email: 'john@hackflow.dev',
      role: 'organizer',
      organization: 'HackFlow Community'
    };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findById('users', decoded.id);
    return user || null;
  } catch (err) {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const user = resolveUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Access denied. Valid authentication token required.' });
  }
  req.user = user;
  next();
}

function optionalAuth(req, res, next) {
  const user = resolveUserFromRequest(req);
  if (user) {
    req.user = user;
  }
  next();
}

function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Authentication required.' });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Role '${req.user.role}' not permitted.` });
    }
    next();
  };
}

/**
 * Contextual Hackathon-Specific RBAC Authorization Middleware
 * Verifies whether the authenticated user holds an ACTIVE privileged role (e.g. JUDGE or ORGANIZER)
 * specifically for the target hackathon.
 */
function requireHackathonRole(roles = ['JUDGE', 'ORGANIZER']) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Authentication required.' });
    }

    // Global organizer role has platform supervision privileges
    if (req.user.role === 'organizer') {
      return next();
    }

    // Determine target hackathonId from route parameters, body, or query
    let hackathonId = req.params.hackathonId || req.body.hackathonId || req.query.hackathonId;

    // If route targets a project by ID (e.g., /api/projects/:id/score), lookup the project's hackathonId
    if (!hackathonId && req.params.id) {
      const project = db.findById('projects', req.params.id);
      if (project) {
        hackathonId = project.hackathonId;
      }
    }

    if (!hackathonId) {
      hackathonId = '1';
    }

    const targetRoles = roles.map(r => r.toUpperCase());

    // Check hackathonMembers collection for an active assignment
    const membership = db.findOne('hackathonMembers', hm => {
      const isUserMatch = (
        (hm.userId && hm.userId === req.user.id) ||
        (req.user.email && hm.userEmail && hm.userEmail.toLowerCase() === req.user.email.toLowerCase())
      );
      const isHackathonMatch = String(hm.hackathonId) === String(hackathonId);
      const isActive = (hm.status === 'ACTIVE' || hm.status === 'active');
      return isUserMatch && isHackathonMatch && isActive;
    });

    if (!membership || !targetRoles.includes(membership.role.toUpperCase())) {
      return res.status(403).json({
        error: 'You are not an authorized judge for this hackathon.',
        message: `Requires verified role: ${targetRoles.join(' or ')} for competition #${hackathonId}.`,
        hackathonId,
      });
    }

    req.hackathonMembership = membership;
    next();
  };
}

module.exports = {
  authMiddleware,
  optionalAuth,
  requireRole,
  requireHackathonRole,
};
