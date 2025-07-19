// src/data/scheduleData.js
export const scheduleData = [
    {
      date: "Tuesday, June 16, 2025",
      bookedSlots: 2,
      totalSlots: 4,
      timeSlots: [
        {
          time: "09:00",
          isAvailable: true,
          statusText: "Available slot",
        },
        {
          time: "10:00",
          isAvailable: true,
          statusText: "Available slot",
        },      {
          time: "11:00",
          isAvailable: false,
          clientName: "Matthew Paul",
          clientId: "1", // ID khớp với trang Clients
        },
        {
          time: "14:00",
          isAvailable: false,
          clientName: "Sophia Rodriguez",
          clientId: "2", // ID khớp với trang Clients
        },
      ],
    },
    {
      date: "Wednesday, June 17, 2025",
      bookedSlots: 1,
      totalSlots: 4,
      timeSlots: [      {
          time: "09:00",
          isAvailable: false,
          clientName: "David Chen",
          clientId: "3", // ID khớp với trang Clients
        },
        {
          time: "10:00",
          isAvailable: true,
          statusText: "Available slot",
        },
        {
          time: "11:00",
          isAvailable: true,
          statusText: "Available slot",
        },
        {
          time: "14:00",
          isAvailable: true,
          statusText: "Available slot",
        },
      ],
    },  {
      date: "Thursday, June 18, 2025",
      bookedSlots: 1,
      totalSlots: 4,
      timeSlots: [
        {
          time: "09:00",
          isAvailable: true,
          statusText: "Available slot",
        },
        {
          time: "10:00",
          isAvailable: false,
          clientName: "Emily Johnson",
          clientId: "4", // ID khớp với trang Clients
        },
        {
          time: "11:00",
          isAvailable: true,
          statusText: "Available slot",
        },
        {
          time: "14:00",
          isAvailable: true,
          statusText: "Available slot",
        },
      ],
    },
  ];
  