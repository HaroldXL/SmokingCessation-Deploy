// Mock data cho clients với thông tin đầy đủ và đồng nhất
export const clients = [
  {
    id: 1,
    name: "Matthew Paul",
    email: "matthew.paul@email.com",
    phone: "+1 (555) 123-4567",
    joinDate: "2024-01-01",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    
    // Thông tin hút thuốc cơ bản (hiển thị trong Client list)
    smokingHistory: {
      yearsSmoked: 15,
      cigarettesPerDay: 20,
      quitAttempts: 3,
      startAge: 18,
      brands: ["Marlboro", "Camel"],
      triggerSituations: ["Stress at work", "Social events", "After meals"]
    },
    
    // Tiến độ hiện tại (hiển thị trong Client list)
    currentProgress: {
      daysSmokeFreee: 14,
      cravingLevel: 3,
      lastSession: "2024-01-14",
      nextSession: "2024-01-21",
    },
    
    status: "active",
    progressPercentage: 75,
    
    // Thông tin chi tiết cho modal/details page
    detailedInfo: {
      totalSavings: 1250,
      consultationsAttended: 8,
      totalConsultations: 12,
      motivations: [
        "Improve health for family",
        "Save money for vacation", 
        "Better physical fitness",
        "Be a good role model for children"
      ],
      goals: [
        "Complete 30 smoke-free days",
        "Attend all scheduled sessions",
        "Develop healthy coping strategies",
        "Reduce stress without cigarettes"
      ],
      notes: "Client showing good progress. Recommend increasing session frequency during high-stress periods.",
      
      // Lịch sử hút thuốc chi tiết (cho modal view details)
      smokingProgressHistory: [
        { 
          date: "2024-01-01", 
          smokeFree: true, 
          cravingLevel: 8,
          notes: "First day - very challenging but determined"
        },
        { 
          date: "2024-01-02", 
          smokeFree: true, 
          cravingLevel: 7,
          notes: "Used nicotine gum when cravings hit"
        },
        { 
          date: "2024-01-03", 
          smokeFree: false, 
          cravingLevel: 9,
          notes: "Relapsed during work stress - learned trigger"
        },
        { 
          date: "2024-01-04", 
          smokeFree: true, 
          cravingLevel: 6,
          notes: "Back on track, used deep breathing technique"
        },
        { 
          date: "2024-01-05", 
          smokeFree: true, 
          cravingLevel: 5,
          notes: "Attended support group meeting"
        },
        { 
          date: "2024-01-06", 
          smokeFree: true, 
          cravingLevel: 4,
          notes: "Weekend was easier, spent time with family"
        },
        { 
          date: "2024-01-07", 
          smokeFree: true, 
          cravingLevel: 5,
          notes: "Monday work stress but managed with meditation"
        },
        { 
          date: "2024-01-08", 
          smokeFree: true, 
          cravingLevel: 3,
          notes: "Feeling more confident in abilities"
        },
        { 
          date: "2024-01-09", 
          smokeFree: true, 
          cravingLevel: 4,
          notes: "Social event - avoided smoking areas"
        },
        { 
          date: "2024-01-10", 
          smokeFree: true, 
          cravingLevel: 3,
          notes: "Session with mentor - learned new strategies"
        },
        { 
          date: "2024-01-11", 
          smokeFree: true, 
          cravingLevel: 2,
          notes: "Best day yet - minimal cravings"
        },
        { 
          date: "2024-01-12", 
          smokeFree: true, 
          cravingLevel: 3,
          notes: "Steady progress continues"
        },
        { 
          date: "2024-01-13", 
          smokeFree: true, 
          cravingLevel: 3,
          notes: "Two weeks milestone reached!"
        },
        { 
          date: "2024-01-14", 
          smokeFree: true, 
          cravingLevel: 3,
          notes: "Current day - feeling optimistic"
        }
      ],
      
      // Consultation history cho ClientDetails page
      consultationHistory: [
        {
          id: 1,
          date: "2024-01-14",
          type: "Video Session",
          notes: "Discussed coping strategies for stress. Matthew is improving with breathing exercises."
        },
        {
          id: 2,
          date: "2024-01-07",
          type: "Video Session",
          notes: "Weekly check-in. Matthew reported strong motivation despite challenges."
        },
        {
          id: 3,
          date: "2024-01-01",
          type: "Initial Consultation",
          notes: "First session - established goals and quit plan."
        }
      ],
      
      // Progress log cho calendar (ClientDetails page)
      progressLog: {
        "2024-01-01": "smoke-free",
        "2024-01-02": "smoke-free",
        "2024-01-03": "relapse",
        "2024-01-04": "smoke-free",
        "2024-01-05": "smoke-free",
        "2024-01-06": "smoke-free",
        "2024-01-07": "smoke-free",
        "2024-01-08": "smoke-free",
        "2024-01-09": "smoke-free",
        "2024-01-10": "smoke-free",
        "2024-01-11": "smoke-free",
        "2024-01-12": "smoke-free",
        "2024-01-13": "smoke-free",
        "2024-01-14": "smoke-free",
      },
      
      // Thống kê chi tiết
      statistics: {
        longestStreakDays: 11,
        totalRelapses: 1,
        averageCravingLevel: 4.2,
        successRate: 92.8,
        moneySavedPerDay: 15,
        cigarettesAvoided: 280
      }
    }
  },
  
  {
    id: 2,
    name: "Sophia Rodriguez",
    email: "sophia.rodriguez@email.com",
    phone: "+1 (555) 987-6543",
    joinDate: "2024-01-08",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b3db?w=100&h=100&fit=crop&crop=face",
    
    smokingHistory: {
      yearsSmoked: 8,
      cigarettesPerDay: 15,
      quitAttempts: 2,
      startAge: 20,
      brands: ["Virginia Slims", "Marlboro Light"],
      triggerSituations: ["Morning coffee", "Work breaks", "Driving"]
    },
    
    currentProgress: {
      daysSmokeFreee: 7,
      cravingLevel: 6,
      lastSession: "2024-01-13",
      nextSession: "2024-01-20",
    },
    
    status: "at-risk",
    progressPercentage: 45,
    
    detailedInfo: {
      totalSavings: 525,
      consultationsAttended: 4,
      totalConsultations: 8,
      motivations: [
        "Better skin and appearance",
        "Improve breathing for yoga",
        "Save money for travel"
      ],
      goals: [
        "Complete 14 smoke-free days",
        "Find healthy morning routine",
        "Build support network"
      ],
      notes: "Client struggling with morning routine. Recommend alternative habits for coffee time.",
      
      smokingProgressHistory: [
        { 
          date: "2024-01-08", 
          smokeFree: true, 
          cravingLevel: 8,
          notes: "Starting journey - nervous but excited"
        },
        { 
          date: "2024-01-09", 
          smokeFree: false, 
          cravingLevel: 9,
          notes: "Morning coffee trigger too strong"
        },
        { 
          date: "2024-01-10", 
          smokeFree: true, 
          cravingLevel: 7,
          notes: "Switched to tea instead of coffee"
        },
        { 
          date: "2024-01-11", 
          smokeFree: true, 
          cravingLevel: 6,
          notes: "Tea helping with morning routine"
        },
        { 
          date: "2024-01-12", 
          smokeFree: true, 
          cravingLevel: 7,
          notes: "Work stress increased cravings"
        },
        { 
          date: "2024-01-13", 
          smokeFree: true, 
          cravingLevel: 6,
          notes: "Session helped with stress management"
        },
        { 
          date: "2024-01-14", 
          smokeFree: true, 
          cravingLevel: 6,
          notes: "One week milestone - proud of progress"
        }
      ],
      
      consultationHistory: [
        {
          id: 1,
          date: "2024-01-13",
          type: "Video Session",
          notes: "Discussed morning routine triggers. Recommended tea substitution strategy."
        },
        {
          id: 2,
          date: "2024-01-10",
          type: "Video Session",
          notes: "Addressed relapse on day 2. Identified coffee as main trigger."
        },
        {
          id: 3,
          date: "2024-01-08",
          type: "Initial Consultation",
          notes: "First session - established goals focusing on appearance and health benefits."
        }
      ],
      
      progressLog: {
        "2024-01-08": "smoke-free",
        "2024-01-09": "relapse",
        "2024-01-10": "smoke-free",
        "2024-01-11": "smoke-free",
        "2024-01-12": "smoke-free",
        "2024-01-13": "smoke-free",
        "2024-01-14": "smoke-free",
      },
      
      statistics: {
        longestStreakDays: 6,
        totalRelapses: 1,
        averageCravingLevel: 6.8,
        successRate: 85.7,
        moneySavedPerDay: 11.25,
        cigarettesAvoided: 105
      }
    }
  },
  
  {
    id: 3,
    name: "James Wilson",
    email: "james.wilson@email.com",
    phone: "+1 (555) 456-7890",
    joinDate: "2023-12-15",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    
    smokingHistory: {
      yearsSmoked: 25,
      cigarettesPerDay: 30,
      quitAttempts: 5,
      startAge: 16,
      brands: ["Camel", "Lucky Strike", "Marlboro Red"],
      triggerSituations: ["Work stress", "Driving", "After meals", "Social drinking"]
    },
    
    currentProgress: {
      daysSmokeFreee: 45,
      cravingLevel: 2,
      lastSession: "2024-01-10",
      nextSession: "2024-01-17",
    },
    
    status: "active",
    progressPercentage: 90,
    
    detailedInfo: {
      totalSavings: 3375,
      consultationsAttended: 15,
      totalConsultations: 16,
      motivations: [
        "Health concerns from doctor",
        "Grandchildren's health",
        "Financial savings for retirement",
        "Better physical endurance"
      ],
      goals: [
        "Reach 60 smoke-free days",
        "Complete program successfully",
        "Maintain long-term abstinence",
        "Help other quitters as mentor"
      ],
      notes: "Excellent progress. Client has become a role model for others. Very committed and disciplined.",
      
      smokingProgressHistory: [
        // Hiển thị 14 ngày gần nhất từ 45 ngày smoke-free
        { 
          date: "2024-01-01", 
          smokeFree: true, 
          cravingLevel: 2,
          notes: "New year, steady progress continues"
        },
        { 
          date: "2024-01-02", 
          smokeFree: true, 
          cravingLevel: 1,
          notes: "Very minimal cravings"
        },
        { 
          date: "2024-01-03", 
          smokeFree: true, 
          cravingLevel: 2,
          notes: "Work meeting stress handled well"
        },
        { 
          date: "2024-01-04", 
          smokeFree: true, 
          cravingLevel: 1,
          notes: "Confident in abilities now"
        },
        { 
          date: "2024-01-05", 
          smokeFree: true, 
          cravingLevel: 2,
          notes: "Weekend social event - stayed strong"
        },
        { 
          date: "2024-01-06", 
          smokeFree: true, 
          cravingLevel: 1,
          notes: "Family time - reminded of motivations"
        },
        { 
          date: "2024-01-07", 
          smokeFree: true, 
          cravingLevel: 2,
          notes: "Monday motivation high"
        },
        { 
          date: "2024-01-08", 
          smokeFree: true, 
          cravingLevel: 1,
          notes: "Habits becoming natural"
        },
        { 
          date: "2024-01-09", 
          smokeFree: true, 
          cravingLevel: 2,
          notes: "Helped another client today"
        },
        { 
          date: "2024-01-10", 
          smokeFree: true, 
          cravingLevel: 2,
          notes: "Session focused on maintaining success"
        },
        { 
          date: "2024-01-11", 
          smokeFree: true, 
          cravingLevel: 1,
          notes: "Feeling like a non-smoker now"
        },
        { 
          date: "2024-01-12", 
          smokeFree: true, 
          cravingLevel: 2,
          notes: "Proud of transformation"
        },
        { 
          date: "2024-01-13", 
          smokeFree: true, 
          cravingLevel: 1,
          notes: "45-day milestone approaches"
        },
        { 
          date: "2024-01-14", 
          smokeFree: true, 
          cravingLevel: 2,
          notes: "45 days smoke-free achieved!"
        }
      ],
      
      consultationHistory: [
        {
          id: 1,
          date: "2024-01-10",
          type: "Video Session",
          notes: "Discussed strategies for maintaining long-term abstinence. James is a role model for new quitters."
        },
        {
          id: 2,
          date: "2024-01-03",
          type: "Video Session",
          notes: "Weekly check-in. James reported very few cravings and high confidence."
        },
        {
          id: 3,
          date: "2023-12-15",
          type: "Initial Consultation",
          notes: "First session - established quit plan and initial goals."
        }
      ],
      
      progressLog: {
        "2023-12-15": "smoke-free",
        "2023-12-16": "smoke-free",
        "2023-12-17": "smoke-free",
        "2023-12-18": "smoke-free",
        "2023-12-19": "smoke-free",
        "2023-12-20": "smoke-free",
        "2023-12-21": "smoke-free",
        "2023-12-22": "smoke-free",
        "2023-12-23": "smoke-free",
        "2023-12-24": "smoke-free",
        "2023-12-25": "smoke-free",
        "2023-12-26": "smoke-free",
        "2023-12-27": "smoke-free",
        "2023-12-28": "smoke-free",
        "2023-12-29": "smoke-free",
        "2023-12-30": "smoke-free",
        "2023-12-31": "smoke-free",
        "2024-01-01": "smoke-free",
        "2024-01-02": "smoke-free",
        "2024-01-03": "smoke-free",
        "2024-01-04": "smoke-free",
        "2024-01-05": "smoke-free",
        "2024-01-06": "smoke-free",
        "2024-01-07": "smoke-free",
        "2024-01-08": "smoke-free",
        "2024-01-09": "smoke-free",
        "2024-01-10": "smoke-free",
        "2024-01-11": "smoke-free",
        "2024-01-12": "smoke-free",
        "2024-01-13": "smoke-free",
        "2024-01-14": "smoke-free",
      },
      
      // Thống kê chi tiết
      statistics: {
        longestStreakDays: 45,
        totalRelapses: 0,
        averageCravingLevel: 1.6,
        successRate: 100,
        moneySavedPerDay: 22.5,
        cigarettesAvoided: 1350
      }
    }
  },
  
  {
    id: 4,
    name: "Emily Chen",
    email: "emily.chen@email.com",
    phone: "+1 (555) 321-0987",
    joinDate: "2024-01-10",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    
    smokingHistory: {
      yearsSmoked: 12,
      cigarettesPerDay: 25,
      quitAttempts: 1,
      startAge: 19,
      brands: ["Marlboro Light", "Camel Light"],
      triggerSituations: ["Anxiety", "Work pressure", "Social situations", "Boredom"]
    },
    
    currentProgress: {
      daysSmokeFreee: 5,
      cravingLevel: 8,
      lastSession: "2024-01-12",
      nextSession: "2024-01-19",
    },
    
    status: "at-risk",
    progressPercentage: 25,
    
    detailedInfo: {
      totalSavings: 187.5,
      consultationsAttended: 2,
      totalConsultations: 4,
      motivations: [
        "Anxiety about health risks",
        "Pressure from family",
        "Financial concerns"
      ],
      goals: [
        "Complete 7 smoke-free days",
        "Learn anxiety management",
        "Build confidence in quitting",
        "Attend all sessions"
      ],
      notes: "High anxiety levels affecting quit attempts. Recommend additional support and anxiety management techniques.",
      
      smokingProgressHistory: [
        { 
          date: "2024-01-10", 
          smokeFree: false, 
          cravingLevel: 9,
          notes: "First day attempt - very difficult"
        },
        { 
          date: "2024-01-11", 
          smokeFree: true, 
          cravingLevel: 8,
          notes: "Managed first full day with support"
        },
        { 
          date: "2024-01-12", 
          smokeFree: true, 
          cravingLevel: 8,
          notes: "Session day - learned breathing techniques"
        },
        { 
          date: "2024-01-13", 
          smokeFree: true, 
          cravingLevel: 7,
          notes: "Breathing exercises helping slightly"
        },
        { 
          date: "2024-01-14", 
          smokeFree: true, 
          cravingLevel: 8,
          notes: "Current day - struggling but determined"
        }
      ],
      
      consultationHistory: [
        {
          id: 1,
          date: "2024-01-12",
          type: "Video Session",
          notes: "Introduced to breathing techniques for anxiety management. Emily showed determination."
        },
        {
          id: 2,
          date: "2024-01-10",
          type: "Initial Consultation",
          notes: "First session - discussed triggers and initial coping strategies."
        }
      ],
      
      progressLog: {
        "2024-01-10": "relapse",
        "2024-01-11": "smoke-free",
        "2024-01-12": "smoke-free",
        "2024-01-13": "smoke-free",
        "2024-01-14": "smoke-free",
      },
      
      statistics: {
        longestStreakDays: 4,
        totalRelapses: 1,
        averageCravingLevel: 8.0,
        successRate: 80,
        moneySavedPerDay: 18.75,
        cigarettesAvoided: 100
      }
    }
  }
];

// Hàm lấy client theo ID (cho ClientDetails page)
export const getClientById = (id) => {
  return clients.find(client => client.id === parseInt(id));
};

// Hàm lấy tất cả clients (cho Client list page)
export const getAllClients = () => {
  return clients;
};

// Hàm lấy dữ liệu client với thông tin chi tiết (cho modal/details)
export const getClientData = (id) => {
  const client = getClientById(id);
  return client || null;
};

// Hàm lấy lịch sử hút thuốc của client (cho modal view details)
export const getClientSmokingHistory = (id) => {
  const client = getClientById(id);
  return client?.detailedInfo?.smokingProgressHistory || [];
};

// Hàm lấy thống kê của client
export const getClientStatistics = (id) => {
  const client = getClientById(id);
  return client?.detailedInfo?.statistics || {};
};