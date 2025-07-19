// bảng mock data doanh thu
export const REVENUE_DATA = [
  { month: "Jan", premium: 105.46, free: 12.3 },
  { month: "Feb", premium: 119.28, free: 15.7 },
  { month: "Mar", premium: 72.22, free: 9.8 },
  { month: "Apr", premium: 140.80, free: 11.2 },
  { month: "May", premium: 107.64, free: 10.5 },
  { month: "Jun", premium: 149.51, free: 13.9 },
];

// bảng mock data sự phát triển của user (user mới theo tháng)
export const USER_GROWTH_DATA = [
  { month: "Jan", last_month: 400, this_month: 240 },
  { month: "Feb", last_month: 300, this_month: 139 },
  { month: "Mar", last_month: 400, this_month: 180 },
  { month: "Apr", last_month: 278, this_month: 190 },
  { month: "May", last_month: 189, this_month: 480 },
  { month: "Jun", last_month: 239, this_month: 380 },
  { month: "Jul", last_month: 349, this_month: 430 },
];

// bảng mock data sự phát triển của user theo 7 ngày
export const USER_GROWTH_7_DAYS = [
  { period: "1 Jan", last_period: 95, this_period: 68 },
  { period: "2 Jan", last_period: 87, this_period: 45 },
  { period: "3 Jan", last_period: 120, this_period: 89 },
  { period: "4 Jan", last_period: 78, this_period: 112 },
  { period: "5 Jan", last_period: 134, this_period: 98 },
  { period: "6 Jan", last_period: 99, this_period: 145 },
  { period: "7 Jan", last_period: 156, this_period: 167 },
];

// bảng mock data sự phát triển của user theo 30 ngày
export const USER_GROWTH_30_DAYS = [
  { period: "Week 1", last_period: 1200, this_period: 980 },
  { period: "Week 2", last_period: 1050, this_period: 756 },
  { period: "Week 3", last_period: 1380, this_period: 1120 },
  { period: "Week 4", last_period: 890, this_period: 1250 },
];

// Biểu đồ 1: Free Members Distribution
export const FREE_MEMBERS_DISTRIBUTION = [
  { name: "Free Members - Success Quit", value: 408 },
  { name: "Free Members - Failed/Continuing", value: 272 },
];

// Biểu đồ 2: Premium Members Distribution  
export const PREMIUM_MEMBERS_DISTRIBUTION = [
  { name: "Premium Members - Success Quit", value: 250 },
  { name: "Premium Members - Failed/Continuing", value: 70 },
];

// Biểu đồ 3: Overall Members Distribution
export const OVERALL_MEMBERS_DISTRIBUTION = [
  { name: "Free Members", value: 680 },
  { name: "Premium Members", value: 320 },
];

// Member type distribution (doughnut chart)
export const MEMBER_TYPE_DISTRIBUTION = [
  { name: "Premium Members", value: 320, fill: "#FFD600" },
  { name: "Free Members", value: 680, fill: "#bfbfbf" },
  { name: "Free Members Success Rate", value: 300, fill: "#10B981" },
  { name: "Premium Members Success Rate", value: 240, fill: "#F59E0B" },
  { name: "Free Members Failed Rate", value: 380, fill: "#FF1515" },
  { name: "Premium Members Failed Rate", value: 160, fill: "#5C6578" },
];

// Success rate comparison (bar chart) for each milestone
export const SUCCESS_RATE_COMPARISON = {
  7: [
    { name: "Premium", successRate: 0.75 },
    { name: "Free", successRate: 0.55 },
  ],
  21: [
    { name: "Premium", successRate: 0.85 },
    { name: "Free", successRate: 0.65 },
  ],
  30: [
    { name: "Premium", successRate: 0.78 },
    { name: "Free", successRate: 0.60 },
  ],
};

// Detailed analytics cards for each group and milestone
export const MEMBER_ANALYTICS_DETAIL = {
  7: {
    premium: { total: 320, success: 240, notYet: 80 },
    free: { total: 680, success: 374, notYet: 306 },
  },
  21: {
    premium: { total: 320, success: 272, notYet: 48 },
    free: { total: 680, success: 442, notYet: 238 },
  },
  30: {
    premium: { total: 320, success: 250, notYet: 70 },
    free: { total: 680, success: 408, notYet: 272 },
  },
};

// Quit journey milestones for progress bar
export const QUIT_JOURNEY_MILESTONES = [
  { label: "Initial", day: 1 },
  { label: "Critical", day: 7 },
  { label: "Critical", day: 21 },
  { label: "Long-term", day: 30 },
];

// Success Rate Over The Months (line chart)
export const SUCCESS_RATE_MONTHLY = [
  { month: "January", successRate: 12 },
  { month: "February", successRate: 15 },
  { month: "March", successRate: 14 },
  { month: "April", successRate: 18 },
  { month: "May", successRate: 22 },
  { month: "June", successRate: 25 },
];

// Success Rate by User Type
export const SUCCESS_RATE_ALL_USERS = [
  { month: "January", successRate: 12 },
  { month: "February", successRate: 15 },
  { month: "March", successRate: 14 },
  { month: "April", successRate: 18 },
  { month: "May", successRate: 22 },
  { month: "June", successRate: 25 },
];

export const SUCCESS_RATE_FREE_MEMBERS = [
  { month: "January", successRate: 8 },
  { month: "February", successRate: 11 },
  { month: "March", successRate: 10 },
  { month: "April", successRate: 14 },
  { month: "May", successRate: 18 },
  { month: "June", successRate: 21 },
];

export const SUCCESS_RATE_PREMIUM_MEMBERS = [
  { month: "January", successRate: 18 },
  { month: "February", successRate: 22 },
  { month: "March", successRate: 20 },
  { month: "April", successRate: 25 },
  { month: "May", successRate: 28 },
  { month: "June", successRate: 32 },
];

// Constants cho tính toán
export const MEMBERS_STATS = {
  free: {
    total: 680,
    success: 408,
    failed: 272,
    successRate: 60.0, // 408/680 = 60%
  },
  premium: {
    total: 320,
    success: 250,
    failed: 70,
    successRate: 78.1, // 250/320 = 78.1%
  },
  overall: {
    total: 1000, // 680 + 320
    totalSuccess: 658, // 408 + 250
    totalFailed: 342, // 272 + 70
    overallSuccessRate: 65.8, // 658/1000 = 65.8%
  },
};