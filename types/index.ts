export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'college' | 'coordinator' | 'student';
    collegeId?: string;
    departmentId?: string;
}

export interface ICollege {
    _id: string;
    name: string;
    email: string;
    status: string;
}

export interface IDepartment {
    _id: string;
    name: string;
    collegeId: string;
}

export interface IEvent {
    _id: string;
    name: string;
    date: string; // ISO date string
    venue: string;
    fee: number;
    description?: string;
    maxParticipants: number;
    collegeId: string;
    departmentId?: IDepartment | string; // Populated or ID
    coordinatorId?: string;
    completed: boolean;
    createdAt?: string;
}

export interface IRegistration {
    _id: string;
    studentId: IUser | string;
    eventId: IEvent | string;
    paymentStatus: string;
    attendance: boolean;
    certificateGenerated: boolean;
    amount?: number;
}

export interface ICertificate {
    _id: string;
    studentId: string;
    eventId: IEvent;
    registrationId: string;
    pdfUrl: string;
    issuedAt: string;
}
