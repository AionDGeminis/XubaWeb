
import { HttpHeaders } from "@angular/common/http";
//const AuthorizateToken = localStorage.getItem("AuthTokenSoloConsulta");
const AuthorizateToken = localStorage.getItem("1ZvMlZhUnGFMWhVU");
// const TmpAuthorizateToken = localStorage.getItem("Tmp_AuthToken");

//QXV0aFRva2Vu === 'AuthToken'
//UVhWMGFGUnZhMlZ1 = 'QXV0aFRva2Vu'
//1ZvMlZhUnGFMWhVU = 'UVhWMGFGUnZhMlZ1'  reverse

export const environment = {

  base_url:'http://173.208.155.152:8088/api',
  token_url:'http://173.208.155.152:8088/api/login/authenticate',
//   image_url:'http://173.208.155.152:8088/api/'

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