// Types related to alerts and notifications

export interface InfringementAlert {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  date: string;
  content?: string;
  confidenceScore?: number;
  timestamp?: string;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: string;
  read: boolean;
}

export interface AlertResponse {
  message: string;
  status: 'resolved' | 'ignored' | 'escalated';
  notes?: string;
  respondedAt: string;
  respondedBy: string;
}

export interface AlertFilter {
  severity?: string[];
  type?: string[];
  status?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
}