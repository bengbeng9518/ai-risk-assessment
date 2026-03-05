export const calculateDimensionScore = (dimensionData, weights) => {
  const values = Object.values(dimensionData);
  let weightedSum = 0;
  let totalWeight = 0;
  
  values.forEach((value, index) => {
    weightedSum += value * weights[index];
    totalWeight += weights[index];
  });
  
  return (weightedSum / totalWeight) * 20;
};

export const calculateRiskScore = (careerData, personalizedFactors = null) => {
  const automationScore = calculateDimensionScore(careerData.dimensions.automation, [0.25, 0.25, 0.25]);
  const skillScore = calculateDimensionScore(careerData.dimensions.skillComplexity, [0.3, 0.3, 0.4]);
  const dataScore = calculateDimensionScore(careerData.dimensions.dataAvailability, [0.33, 0.33, 0.34]);
  const techScore = calculateDimensionScore(careerData.dimensions.techMaturity, [0.4, 0.3, 0.3]);
  
  let adjustedScores = {
    automation: automationScore,
    skillComplexity: skillScore,
    dataAvailability: dataScore,
    techMaturity: techScore
  };
  
  if (personalizedFactors && personalizedFactors.companyType !== 'default') {
    adjustedScores = applyCompanyTypeAdjustment(adjustedScores, personalizedFactors.companyType);
  }
  
  if (personalizedFactors && personalizedFactors.jobLevel) {
    adjustedScores = applyJobLevelAdjustment(adjustedScores, personalizedFactors.jobLevel);
  }
  
  if (personalizedFactors && personalizedFactors.aiExposure !== undefined) {
    adjustedScores = applyFactorAdjustment(adjustedScores, 'aiExposure', personalizedFactors.aiExposure);
  }
  
  if (personalizedFactors && personalizedFactors.creativeRequirement !== undefined) {
    adjustedScores = applyFactorAdjustment(adjustedScores, 'creativeRequirement', personalizedFactors.creativeRequirement);
  }
  
  if (personalizedFactors && personalizedFactors.humanInteraction !== undefined) {
    adjustedScores = applyFactorAdjustment(adjustedScores, 'humanInteraction', personalizedFactors.humanInteraction);
  }
  
  if (personalizedFactors && personalizedFactors.decisionMaking !== undefined) {
    adjustedScores = applyFactorAdjustment(adjustedScores, 'decisionMaking', personalizedFactors.decisionMaking);
  }
  
  const riskScore = 100 - (
    (adjustedScores.automation * 0.3 + 
    (100 - adjustedScores.skillComplexity) * 0.3 + 
    adjustedScores.dataAvailability * 0.2 + 
    adjustedScores.techMaturity * 0.2) / 4
  );
  
  let riskLevel;
  if (riskScore < 30) riskLevel = "低";
  else if (riskScore < 70) riskLevel = "中等";
  else riskLevel = "高";
  
  const recommendations = generateRecommendations(riskLevel, careerData, personalizedFactors);
  
  return { 
    riskScore: Math.round(riskScore), 
    riskLevel, 
    breakdown: { 
      automation: Math.round(adjustedScores.automation), 
      skillComplexity: Math.round(adjustedScores.skillComplexity), 
      dataAvailability: Math.round(adjustedScores.dataAvailability), 
      techMaturity: Math.round(adjustedScores.techMaturity) 
    },
    recommendations,
    isPersonalized: personalizedFactors !== null && Object.keys(personalizedFactors).length > 0
  };
};

const applyCompanyTypeAdjustment = (scores, companyType) => {
  const adjustments = {
    'tech_giant': { automation: 15, skillComplexity: -10, dataAvailability: 15, techMaturity: 20 },
    'traditional_tech': { automation: 8, skillComplexity: -5, dataAvailability: 8, techMaturity: 10 },
    'traditional_industry': { automation: -5, skillComplexity: 5, dataAvailability: -8, techMaturity: -10 },
    'startup': { automation: 10, skillComplexity: -8, dataAvailability: 5, techMaturity: 5 },
    'government': { automation: -10, skillComplexity: 8, dataAvailability: -15, techMaturity: -20 },
    'education': { automation: -8, skillComplexity: 10, dataAvailability: -10, techMaturity: -15 },
    'medical': { automation: -5, skillComplexity: 12, dataAvailability: 10, techMaturity: 5 },
    'finance': { automation: 12, skillComplexity: -5, dataAvailability: 15, techMaturity: 15 }
  };
  
  const adjustment = adjustments[companyType] || { automation: 0, skillComplexity: 0, dataAvailability: 0, techMaturity: 0 };
  
  return {
    automation: Math.max(0, Math.min(100, scores.automation + adjustment.automation)),
    skillComplexity: Math.max(0, Math.min(100, scores.skillComplexity + adjustment.skillComplexity)),
    dataAvailability: Math.max(0, Math.min(100, scores.dataAvailability + adjustment.dataAvailability)),
    techMaturity: Math.max(0, Math.min(100, scores.techMaturity + adjustment.techMaturity))
  };
};

const applyJobLevelAdjustment = (scores, jobLevel) => {
  const adjustments = {
    'intern': { automation: 15, skillComplexity: -20 },
    'mid': { automation: 5, skillComplexity: 0 },
    'senior': { automation: -10, skillComplexity: 15 },
    'lead': { automation: -15, skillComplexity: 20 },
    'manager': { automation: -20, skillComplexity: 25 },
    'executive': { automation: -25, skillComplexity: 30 }
  };
  
  const adjustment = adjustments[jobLevel] || { automation: 0, skillComplexity: 0 };
  
  return {
    ...scores,
    automation: Math.max(0, Math.min(100, scores.automation + adjustment.automation)),
    skillComplexity: Math.max(0, Math.min(100, scores.skillComplexity + adjustment.skillComplexity))
  };
};

const applyFactorAdjustment = (scores, factor, value) => {
  const factorWeights = {
    'aiExposure': { automation: 0.5, skillComplexity: 0, dataAvailability: 0.3, techMaturity: 0.2 },
    'creativeRequirement': { automation: -0.4, skillComplexity: 0.6, dataAvailability: 0, techMaturity: 0 },
    'humanInteraction': { automation: -0.3, skillComplexity: 0.3, dataAvailability: 0, techMaturity: 0.1 },
    'decisionMaking': { automation: -0.3, skillComplexity: 0.5, dataAvailability: 0.1, techMaturity: 0.1 }
  };
  
  const weights = factorWeights[factor];
  if (!weights) return scores;
  
  const normalizedValue = (value - 50) / 50;
  
  return {
    automation: Math.max(0, Math.min(100, scores.automation + weights.automation * normalizedValue * 20)),
    skillComplexity: Math.max(0, Math.min(100, scores.skillComplexity + weights.skillComplexity * normalizedValue * 20)),
    dataAvailability: Math.max(0, Math.min(100, scores.dataAvailability + weights.dataAvailability * normalizedValue * 20)),
    techMaturity: Math.max(0, Math.min(100, scores.techMaturity + weights.techMaturity * normalizedValue * 20))
  };
};

const generateRecommendations = (riskLevel, careerData, personalizedFactors) => {
  const recommendations = [];
  
  if (riskLevel === "高") {
    recommendations.push("考虑职业转型或升级技能");
    recommendations.push("发展AI无法替代的软技能");
    recommendations.push("学习与AI协作的能力");
  } else if (riskLevel === "中等") {
    recommendations.push("提升创造性思维能力");
    recommendations.push("发展跨领域技能");
    recommendations.push("关注AI辅助工具的使用");
  } else {
    recommendations.push("保持技能更新");
    recommendations.push("探索与AI结合的新机会");
    recommendations.push("关注行业发展趋势");
  }
  
  if (personalizedFactors) {
    if (personalizedFactors.companyType === 'tech_giant') {
      recommendations.push("关注公司内部AI培训机会，提升AI协作能力");
    } else if (personalizedFactors.companyType === 'government' || personalizedFactors.companyType === 'education') {
      recommendations.push("虽然当前风险较低，但建议关注行业技术发展趋势");
    }
    
    if (personalizedFactors.jobLevel === 'intern') {
      recommendations.push("作为新人，建议尽快掌握AI工具使用技能");
    } else if (personalizedFactors.jobLevel === 'executive') {
      recommendations.push("作为管理者，建议推动团队AI能力建设");
    }
  }
  
  return recommendations;
};