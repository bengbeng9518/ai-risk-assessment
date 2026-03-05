import { careers } from '../data/careers';
import { calculateRiskScore } from '../utils/assessment';

export const assessCareer = (careerName, personalizedFactors = null) => {
  const career = careers.find(c => c.name === careerName);
  
  let careerData;
  let isCustomCareer = false;
  
  if (!career) {
    isCustomCareer = true;
    careerData = createCustomCareer(careerName);
  } else {
    careerData = career;
  }
  
  const assessment = calculateRiskScore(careerData, personalizedFactors);
  return {
    career: careerData.name,
    category: isCustomCareer ? '自定义职业' : careerData.category,
    ...assessment,
    personalizedFactors,
    isCustomCareer
  };
};

const createCustomCareer = (careerName) => {
  return {
    id: 'custom',
    name: careerName,
    category: '自定义职业',
    dimensions: {
      automation: {
        routine: estimateDimension(careerName, 'routine', 50),
        cognitive: estimateDimension(careerName, 'cognitive', 50),
        manual: estimateDimension(careerName, 'manual', 40)
      },
      skillComplexity: {
        education: estimateDimension(careerName, 'education', 60),
        experience: estimateDimension(careerName, 'experience', 50),
        creativity: estimateDimension(careerName, 'creativity', 50)
      },
      dataAvailability: {
        digital: estimateDimension(careerName, 'digital', 60),
        structured: estimateDimension(careerName, 'structured', 50),
        historical: estimateDimension(careerName, 'historical', 40)
      },
      techMaturity: {
        ai_capable: estimateDimension(careerName, 'ai_capable', 60),
        tools_available: estimateDimension(careerName, 'tools_available', 50),
        adoption: estimateDimension(careerName, 'adoption', 40)
      }
    }
  };
};

const estimateDimension = (careerName, dimension, defaultValue) => {
  const careerLower = careerName.toLowerCase();
  
  const keywords = {
    routine: ['会计', '客服', '文员', '录入', '审核', '收银', '流水线', '质检'],
    cognitive: ['分析', '策划', '设计', '研发', '咨询', '医生', '律师', '教师'],
    manual: ['司机', '厨师', '维修', '护理', '建筑', '美甲', '理发'],
    education: ['医生', '律师', '教授', '工程师', '建筑师', '飞行员'],
    experience: ['管理', '顾问', '专家', '资深', '总监', '经理'],
    creativity: ['设计', '策划', '艺术', '音乐', '写作', '编剧', '摄影'],
    digital: ['工程师', '设计师', '分析师', '程序员', '运营'],
    structured: ['会计', '律师', '医生', '教师', '顾问'],
    historical: ['医生', '律师', '顾问', '分析师', '研究员'],
    ai_capable: ['工程师', '设计师', '分析师', '程序员', '客服'],
    tools_available: ['工程师', '设计师', '运营', '营销', '教师'],
    adoption: ['工程师', '设计师', '运营', '营销', '客服']
  };
  
  for (const [key, words] of Object.entries(keywords)) {
    if (key === dimension && words.some(w => careerLower.includes(w))) {
      return Math.min(100, defaultValue + 15);
    }
  }
  
  const highRiskKeywords = ['会计', '客服', '录入', '文员', '收银', '翻译', '司机'];
  const lowRiskKeywords = ['医生', '律师', '教师', '设计师', '艺术家', '心理咨询'];
  
  if (dimension === 'routine' || dimension === 'ai_capable') {
    if (highRiskKeywords.some(w => careerLower.includes(w))) {
      return Math.min(100, defaultValue + 20);
    }
    if (lowRiskKeywords.some(w => careerLower.includes(w))) {
      return Math.max(0, defaultValue - 20);
    }
  }
  
  if (dimension === 'creativity' || dimension === 'experience') {
    if (lowRiskKeywords.some(w => careerLower.includes(w))) {
      return Math.min(100, defaultValue + 15);
    }
  }
  
  return defaultValue;
};

export const getCareers = () => {
  return careers.map(c => ({
    id: c.id,
    name: c.name,
    category: c.category
  }));
};

export const getInsights = () => {
  return {
    highestRisk: "会计师",
    lowestRisk: "艺术家",
    trending: ["软件工程师", "数据科学家"]
  };
};