export default function getCurrentBrowser(){
    const userAgent = navigator.userAgent
    if(userAgent.indexOf("Edg") > -1){
        return "Microsoft Edge"
    }
    else if(userAgent.indexOf("Firefox") > -1){
        return "Mozilla Firefox"
    }
    else if(userAgent.indexOf("Chrome") > -1){
        return "Google Chrome"
    }
    else if(userAgent.indexOf("Safari") > -1){
        return "Apple Safari"
    }
    else if(userAgent.indexOf("Opera") > -1){
        return "Opera"
    }
}