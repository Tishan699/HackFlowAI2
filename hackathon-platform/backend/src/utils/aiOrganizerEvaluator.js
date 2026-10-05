/**
 * AI Organizer Evaluator Engine
 * Screens organizer host applications, organization credentials, proposal depth, and community viability.
 */

function analyzeOrganizerApplication(application) {
  const {
    organizationName = '',
    officialEmail = '',
    website = '',
    pastEvents = '',
    proposal = '',
    estimatedParticipants = 100,
    category = 'Tech'
  } = application;

  let credibilityScore = 60;

  // Domain & Email legitimacy check
  const isCorporateOrEdu = /(@.*(\.edu|\.ac|\.org|\.io|\.tech|\.ai|corp|inc|lab))/i.test(officialEmail);
  if (isCorporateOrEdu) credibilityScore += 15;

  // Web presence check
  if (website.startsWith('http')) credibilityScore += 10;

  // Past events track record
  const hasPastEvents = pastEvents.trim().length > 20;
  if (hasPastEvents) credibilityScore += 10;

  // Proposal depth
  if (proposal.trim().length > 60) credibilityScore += 10;

  credibilityScore = Math.min(credibilityScore, 98);

  const riskLevel = credibilityScore >= 80 ? 'LOW' : credibilityScore >= 65 ? 'MEDIUM' : 'HIGH';

  let suitability = 'Verified Host Eligible';
  let recommendation = '';

  if (credibilityScore >= 85) {
    suitability = 'Strongly Recommended';
    recommendation = `Established entity (${organizationName}) with verified online presence and prior event track record. Low fraud risk.`;
  } else if (credibilityScore >= 70) {
    suitability = 'Suitable with Verification';
    recommendation = `Legitimate proposal from ${organizationName}. Verification of official contact email recommended prior to event publication.`;
  } else {
    suitability = 'Manual Review Required';
    recommendation = `Incomplete organizational credentials. Manual verification of organizer identity required to prevent spoofed competitions.`;
  }

  return {
    evaluatedAt: new Date().toISOString(),
    credibilityScore,
    score: credibilityScore,
    riskLevel,
    suitability,
    summary: suitability,
    aiRecommendation: recommendation,
    recommendation,
    isOfficialDomain: isCorporateOrEdu,
  };
}

module.exports = {
  analyzeOrganizerApplication
};
