export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    createdAt: string;
    }
    
    
    export interface Chat {
    id: string;
    members: string[]; // user ids
    lastUpdated?: string;
    }