/**
 * AI Event Change & Sensitive Field Analyzer
 * Analyzes event modifications when participants have already registered.
 * Determines grievance risk, participant impact, and generates recommendations for Platform Admins.
 */

const SENSITIVE_FIELDS = [
  'prizePool',
  'prizes',
  'startDate',
  'endDate',
  'registrationDeadline',
  'entryFee',
  'maxTeams',
  'eligibility'
];

function isSensitiveField(field) {
  return SENSITIVE_FIELDS.includes(field);
}

function analyzeEventChange({ field, beforeValue, afterValue, participantsCount = 0, eventTitle = 'Hackathon' }) {
  let riskLevel = 'LOW';
  let impactSummary = '';
  let aiRecommendation = '';
  let requiresApproval = false;

  // If no participants have registered, changes have zero participant impact
  if (participantsCount === 0) {
    return {
      isSensitive: isSensitiveField(field),
      requiresApproval: false,
      riskLevel: 'LOW',
      impactSummary: 'No participants registered yet. Change has zero impact on registered teams.',
      aiRecommendation: 'Auto-apply permissible prior to participant registrations.',
      analyzedAt: new Date().toISOString()
    };
  }

  // Handle sensitive fields with registered participants
  switch (field) {
    case 'prizePool': {
      requiresApproval = true;
      const beforeStr = String(beforeValue || '');
      const afterStr = String(afterValue || '');

      // Parse numerical values if available
      const beforeNum = parseInt(beforeStr.replace(/[^0-9]/g, ''), 10) || 0;
      const afterNum = parseInt(afterStr.replace(/[^0-9]/g, ''), 10) || 0;

      if (afterNum < beforeNum) {
        riskLevel = 'HIGH';
        const reductionPct = beforeNum > 0 ? Math.round(((beforeNum - afterNum) / beforeNum) * 100) : 0;
        impactSummary = `Prize pool reduced by ${reductionPct}% (from ${beforeStr} to ${afterStr}) with ${participantsCount} registered participants. Critical risk of community dispute and reputational damage.`;
        aiRecommendation = 'Flagged for strict platform administrative review. Recommend requiring organizer justification or participant consensus.';
      } else if (afterNum > beforeNum) {
        riskLevel = 'LOW';
        impactSummary = `Prize pool increased from ${beforeStr} to ${afterStr}. Favorable change for ${participantsCount} registered participants.`;
        aiRecommendation = 'Positive incentive change. Safe for expedited platform approval.';
      } else {
        riskLevel = 'MEDIUM';
        impactSummary = `Prize pool currency or structure modified from "${beforeStr}" to "${afterStr}".`;
        aiRecommendation = 'Verify currency conversions or prize distribution terms before approval.';
      }
      break;
    }

    case 'prizes': {
      requiresApproval = true;
      riskLevel = 'MEDIUM';
      impactSummary = `Prize breakdown modified after ${participantsCount} participants registered.`;
      aiRecommendation = 'Verify that total prize allocation meets published guarantees.';
      break;
    }

    case 'startDate':
    case 'endDate': {
      requiresApproval = true;
      const beforeDate = new Date(beforeValue);
      const afterDate = new Date(afterValue);

      if (!isNaN(beforeDate) && !isNaN(afterDate) && afterDate < beforeDate) {
        riskLevel = 'HIGH';
        impactSummary = `Event timeline moved earlier from ${beforeValue} to ${afterValue}. Registered teams may not be prepared.`;
        aiRecommendation = 'High risk of scheduling conflicts. Require advance participant notification notice.';
      } else {
        riskLevel = 'MEDIUM';
        impactSummary = `Event dates shifted from ${beforeValue} to ${afterValue} for ${participantsCount} registered participants.`;
        aiRecommendation = 'Verify venue and judge availability for new event dates.';
      }
      break;
    }

    case 'registrationDeadline': {
      requiresApproval = true;
      riskLevel = 'MEDIUM';
      impactSummary = `Registration deadline updated from ${beforeValue} to ${afterValue}.`;
      aiRecommendation = 'Check alignment with event kick-off timeline.';
      break;
    }

    case 'maxTeams': {
      requiresApproval = true;
      const beforeTeams = Number(beforeValue) || 100;
      const afterTeams = Number(afterValue) || 100;

      if (afterTeams < beforeTeams && afterTeams < participantsCount) {
        riskLevel = 'HIGH';
        impactSummary = `Capacity reduced to ${afterTeams} teams, which is below the current registered headcount of ${participantsCount}.`;
        aiRecommendation = 'REJECT RECOMMENDED: Cannot reduce capacity below current registration volume.';
      } else {
        riskLevel = 'LOW';
        impactSummary = `Event capacity adjusted from ${beforeTeams} to ${afterTeams} teams.`;
        aiRecommendation = 'Safe operational adjustment.';
      }
      break;
    }

    case 'entryFee': {
      requiresApproval = true;
      riskLevel = 'HIGH';
      impactSummary = `Entry fee structure altered from "${beforeValue}" to "${afterValue}" with active registrations.`;
      aiRecommendation = 'Strict platform review required: existing registered participants cannot be retroactively charged.';
      break;
    }

    default: {
      // Non-sensitive fields (description, venue, rules, banner, etc.)
      requiresApproval = false;
      riskLevel = 'LOW';
      impactSummary = `Field "${field}" updated. Standard operational modification.`;
      aiRecommendation = 'Auto-applied without platform admin intervention.';
      break;
    }
  }

  return {
    isSensitive: isSensitiveField(field),
    requiresApproval,
    riskLevel,
    impactSummary,
    aiRecommendation,
    recommendation: aiRecommendation,
    analyzedAt: new Date().toISOString()
  };
}

module.exports = {
  SENSITIVE_FIELDS,
  isSensitiveField,
  analyzeEventChange
};
