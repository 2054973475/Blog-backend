module.exports={
  resultSuccess:(result, { message = '' } = {})=>{
    return {
      code: 20000,
      result,
      message,
      type: 'success',
    };
  },
  resultError:( message = 'Request failed',
  { code = 60204, result = null } = {})=>{
    return {
      code,
      result,
      message,
      type: 'error',
    };
  }
}