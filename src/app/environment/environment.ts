
import { HttpHeaders } from "@angular/common/http";
//const AuthorizateToken = localStorage.getItem("AuthTokenSoloConsulta");
const AuthorizateToken = localStorage.getItem("1ZvMlZhUnGFMWhVU");
// const TmpAuthorizateToken = localStorage.getItem("Tmp_AuthToken");

//QXV0aFRva2Vu === 'AuthToken'
//UVhWMGFGUnZhMlZ1 = 'QXV0aFRva2Vu'
//1ZvMlZhUnGFMWhVU = 'UVhWMGFGUnZhMlZ1'  reverse

export const environment = {
  //Swagger
  //https://api.xuba.mx:8443/swagger/index.html

  // base_url:'https://api.xuba.mx:8443/api',
  base_url:'https://api.xuba.mx:8443/api',
  // base_url:'https://173.208.155.152:8088/api',
  token_url:'https://api.xuba.mx:8443/api/login/authenticate',
//   image_url:'http://173.208.155.152:8088/api/'
  threeds_redirect_url:'https://www.xuba.mx/payment-callback',
  // threeds_redirect_url:'http://localhost:4200/payment-callback',

  openPayId: 'mz5jjyzabcb3zzpevo0l',
  // openPayApiKey: 'pk_324198c2c6534c8695935c731ec69e5a',
  openPayApiKey: 'pk_f2da5530e74d4c7fbf292d886aba5e50',
  openPaySandBox: true,

  banca_url:'https://banca.xuba.mx:9443/api',
};

export const headers = new HttpHeaders({
  Authorization: `Bearer ${AuthorizateToken}`,
  "Content-Type": "application/json"
});

export const auth_headers = new HttpHeaders({
  "Content-Type": "application/json"
});

export const test_headers = new HttpHeaders({
    "Content-Type": "application/json"
  });