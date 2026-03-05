const USER_DATA_KEY = 'ai_assessment_user_data';
const USER_ID_KEY = 'ai_assessment_user_id';

export const getUserId = () => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const getUserData = () => {
  const userId = getUserId();
  const userData = localStorage.getItem(USER_DATA_KEY);
  
  if (!userData) {
    const initialData = {
      userId,
      freeUsageCount: 5,
      paidUsageCount: 0,
      totalUsageCount: 0,
      aiAnalysisCount: 0,
      aiChatCount: 0,
      reportCount: 0
    };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(initialData));
    return initialData;
  }
  
  return JSON.parse(userData);
};

export const saveUserData = (userData) => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

export const checkAvailableUsage = () => {
  const userData = getUserData();
  return userData.freeUsageCount + userData.paidUsageCount > 0;
};

export const decrementUsage = () => {
  const userData = getUserData();
  if (userData.freeUsageCount > 0) {
    userData.freeUsageCount--;
  } else if (userData.paidUsageCount > 0) {
    userData.paidUsageCount--;
  }
  userData.totalUsageCount++;
  saveUserData(userData);
  return userData;
};

export const addUsageCount = (count) => {
  const userData = getUserData();
  userData.paidUsageCount += count;
  saveUserData(userData);
  return userData;
};

export const decrementAIAnalysis = () => {
  const userData = getUserData();
  userData.aiAnalysisCount++;
  saveUserData(userData);
  return userData;
};

export const decrementAIChat = () => {
  const userData = getUserData();
  userData.aiChatCount++;
  saveUserData(userData);
  return userData;
};

export const decrementReport = () => {
  const userData = getUserData();
  userData.reportCount++;
  saveUserData(userData);
  return userData;
};

export const resetUserData = () => {
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem(USER_ID_KEY);
  return getUserData();
};