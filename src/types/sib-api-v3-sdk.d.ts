declare module 'sib-api-v3-sdk' {
    export namespace ApiClient {
      interface instance {
        authentications: {
          'api-key': {
            apiKey: string;
          };
        };
      }
    }
  
    export class ApiClient {
      static instance: ApiClient.instance;
    }
  
    export class TransactionalEmailsApi {
      sendTransacEmail(sendSmtpEmail: {
        to: Array<{ email: string; name?: string }>;
        templateId: number;
        params?: Record<string, any>;
        headers?: Record<string, string>;
        subject?: string;
        htmlContent?: string;
        textContent?: string;
      }): Promise<any>;
    }
  }