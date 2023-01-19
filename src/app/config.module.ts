export class ConfigModule {
  public static ResponseTemplate =  '{ "Status": false, "AuthHeader": { "IsAuthorized": true, "AuthMessage": "" }, "Data": {}, "Errors": [] }';
  public static ErrorTemplate = '{"Data":{}, "ErrorTitle": "", "ErrorMessage": "" }';
}
