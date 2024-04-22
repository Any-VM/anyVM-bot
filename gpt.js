const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { wrapper: axiosCookieJarSupport } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const models = {
    "gpt-3.5-turbo": {
        "id": "gpt-3.5-turbo",
        "name": "GPT-3.5-Turbo",
        "maxLength": 48000,
        "tokenLimit": 14000,
        "context": "16K",
    },
    "gpt-4-turbo": {
        "id": "gpt-4-turbo-preview",
        "name": "GPT-4-Turbo",
        "maxLength": 260000,
        "tokenLimit": 126000,
        "context": "128K",
    },
    "gpt-4": {
        "id": "gpt-4-plus",
        "name": "GPT-4-Plus",
        "maxLength": 130000,
        "tokenLimit": 31000,
        "context": "32K",
    },
    "gpt-4-0613": {
        "id": "gpt-4-0613",
        "name": "GPT-4-0613",
        "maxLength": 60000,
        "tokenLimit": 15000,
        "context": "16K",
    },
    "gemini-pro": {
        "id": "gemini-pro",
        "name": "Gemini-Pro",
        "maxLength": 120000,
        "tokenLimit": 30000,
        "context": "32K",
    },
    "claude-3-opus-20240229": {
        "id": "claude-3-opus-20240229",
        "name": "Claude-3-Opus",
        "maxLength": 800000,
        "tokenLimit": 200000,
        "context": "200K",
    },
    "claude-3-sonnet-20240229": {
        "id": "claude-3-sonnet-20240229",
        "name": "Claude-3-Sonnet",
        "maxLength": 800000,
        "tokenLimit": 200000,
        "context": "200K",
    },
    "claude-2.1": {
        "id": "claude-2.1",
        "name": "Claude-2.1-200k",
        "maxLength": 800000,
        "tokenLimit": 200000,
        "context": "200K",
    },
    "claude-2.0": {
        "id": "claude-2.0",
        "name": "Claude-2.0-100k",
        "maxLength": 400000,
        "tokenLimit": 100000,
        "context": "100K",
    },
    "claude-instant-1": {
        "id": "claude-instant-1",
        "name": "Claude-instant-1",
        "maxLength": 400000,
        "tokenLimit": 100000,
        "context": "100K",
    }
}

axiosCookieJarSupport(axios);

const cookieJar = new CookieJar();
const axiosInstance = axios.create({
  jar: cookieJar,
  withCredentials: true
});

class Liaobots {
    static url = "https://liaobots.site";
    static working = true;
    static supportsMessageHistory = true;
    static supportsSystemMessage = true;
    static supportsGpt35Turbo = true;
    static supportsGpt4 = true;
    static defaultModel = "gpt-3.5-turbo";
    static models = Object.keys(models); 
    static modelAliases = {
      "claude-v2": "claude-2"
    };
    static _authCode = "pTIQr4FTnVRfr";
    static _cookieJar = cookieJar; 
    static axiosInstance = axios.create({
        withCredentials: true,
        jar: this._cookieJar,
        headers: {
            'Referer': 'https://liaobots.work/?ic=3ZJN4Y',
            'DNT': '1',
            'Sec-GPC': '1',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'x-auth-code':'pTIQr4FTnVRfr',
            'Host': 'liaobots.work'
        }
    });
    static async authenticate(auth = null) {
        this._authCode = auth || this._authCode;
        try {
            
            await this.axiosInstance.post('http://liaobots.work/recaptcha/api/login', {
                token: "abcdefghijklmnopqrst"
            });

           
            try {
                await this.requestUser();
            } catch (error) {
                console.error("First attempt without authCode failed, retrying with stored authCode:", error);
                
                if (this._authCode) {
                    await this.requestUser(this._authCode);
                } else {
                    throw new Error("No stored authCode available for retry.");
                }
            }
        } catch (error) {
            console.error("Authentication Error:", error);
            throw error;
        }
    }

    static async requestUser(authCode = null) {
        let config = {
            headers: {
                'Accept': 'application/json, text/plain, */*'
            }
        };
        let data = {};

        if (authCode) {
            config.headers["x-auth-code"] = authCode;
            data = { authcode: authCode };
        }

       
        const response = await this.axiosInstance.post(`https://liaobots.site/api/user`, data, config);
       
        if (response.data && response.data.authCode) {
            this._authCode = response.data.authCode;
          
            this.axiosInstance.defaults.headers.common['x-auth-code'] = this._authCode;
        }
    }

    static async handleCaptcha() {
        try {
           
            await this.axiosInstance.get(`${this.url}/recaptcha/api/login`);
    
         
            const postResponse = await this.axiosInstance.post(`${this.url}/recaptcha/api/login`, { token: 'abcdefghijklmnopqrst' });
            if (postResponse.data.code != 200) {
                console.error("Captcha handling failed:", postResponse.data.msg);
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error handling captcha:", error);
            return false;
        }
    }
    
    static async createAsyncGenerator(model, messages, auth = null, proxy = null, connector = null, ...kwargs) {
        await this.authenticate(auth);
    
        const data = {
            "conversationId": uuidv4(), 
            "model": {
                "id": "gpt-4-turbo-preview",
                "name": "GPT-4-Turbo",
                "maxLength": 260000,
                "tokenLimit": 126000,
                "model": "ChatGPT",
                "provider": "OpenAI",
                "context": "128K",
            },
            "messages": messages.map(message => ({ role: "user", content: message })),
            "key": "",
            "prompt": kwargs.systemMessage || "You are a helpful assistant."
        };
    
        try {
            const response = await this.axiosInstance.post(`${this.url}/api/chat`, data);
    
        
            const contentType = response.headers['content-type'];
    
           
            if (!contentType.includes('application/json')) {
                const captchaHandled = await this.handleCaptcha();
                if (captchaHandled) {
                  
                    return await this.axiosInstance.post(`${this.url}/api/chat`, data);
                }
            }
    
  
            return response.data.reply;
        } catch (error) {
            console.error("Async Generator Error:", error);
            throw error;
        }
    }

    static getModel(model) {
      return this.modelAliases[model] || model;
    }
}

const args = process.argv.slice(2); 
const message = args.join(' '); 

(async () => {
  try {
    const result = await Liaobots.createAsyncGenerator("gpt-4-turbo", [message]); 
    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
})();