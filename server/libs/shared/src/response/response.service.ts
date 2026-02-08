import { Injectable } from '@nestjs/common';

const Business = {
  SUCCESS: {
    code: 200,
    message: 'success'
  },
  ERROR: {
    code: 500,
    message: 'error'
  }
};

@Injectable()
export class ResponseService {
  success(data: any, message?: string) {
    return {
      code: Business.SUCCESS.code,
      message: message || Business.SUCCESS.message,
      data
    };
  }

  error(data = null, message: string, code = Business.ERROR.code) {
    return {
      code,
      message: message || Business.ERROR.message,
      data
    };
  }
}
