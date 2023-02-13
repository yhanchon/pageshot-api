# Webpage Screenshot API Service

Pagshot-api Project is the webservice behind [Page-shot.com](https://page-shot.com)'s webpage screenshot service. It is Javascript-based, built on the popular NodeJS platform. This screenshot service makes use of Puppeteer NodeJS library, specifically its APIs that support web browsing and screen capturing. This project attempted to handle dynamic-loading or lazy-loading type of websites, where page content only loads if users scrolled passed that part of the page. 

## Clone project
```
git clone https://github.com/yhanchon/pageshot-api.git
```

## Run server
```
$ npm install
$ npm start
```

## Invoking screenshot API

<summary><code>POST</code> <code><b>/api/pageshot</b></code></summary>

##### Parameters

> | name            | type                              | data type  | description                                                                                                                                                                     |
> |-----------------|-----------------------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
> | `url`           | required                          | string     | URL of the target webpage to screenshot                                                                                                                                         |
> | `isFullpage`    | required                          | boolean    | Screenshot in full-page or partial </br>[1 or 0]                                                                                                                                |
> | `deviceName`    | required                          | string     | Device to emulate when taking the screenshot </br>["Desktop", "iPhone X", "iPhone 13", "iPhone 13 Pro Max", "iPad Mini", "iPad Pro", "Galaxy S9+", "Galaxy Tab S4", "Pixel 5"]  |
> | `browserWidth`  |                                   | int        | Width of desktop resolution in pixels (applicable when deviceName="Desktop"). Default value is 1200.                                                                            |
> | `browserHeight` |                                   | int        | Height of desktop resolution in pixels (applicable when deviceName="Desktop"). Default value is 800.                                                                            |

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `image/png`                       | Screenshoot image in Blob format                                    |
> | `400`         | `application/json`                | `{"code":"400","message":"URL specified is invalid"}`               |
> | `404`         | `application/json`                | `{"code":"404","message":"Website cannot be reached"}`              |
> | `408`         | `application/json`                | `{"code":"408","message":"Timeout"}`.                               |
> | `500`         | `application/json`                | `{"code":"500","message":"Unable to capture screenshot"}`           |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" http://localhost:3000/api/pageshot
> ```
