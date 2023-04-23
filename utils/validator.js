const validatePassword = (password)=>{
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);

    return hasUppercase && hasLowercase && hasDigit;
}

const validateUrl = (url)=>{
    const urlRegex = /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-z0-9\-]+(?:\.[a-z0-9\-]+)+[/?#][^\s]*$/i;
    return urlRegex.test(url)
}

const validateEmail = (email)=>{
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    return emailRegex.test(email)
} 

const validateShortUrl = (url,prefix)=>{
    const shortIdRegex = /[a-zA-Z0-9_-]{7,14}/;
    const timestampRegex = /\d{13}/;
    const randomNumRegex = /\d{1,3}/;
    const pattern = `^${prefix}/${shortIdRegex.source}${timestampRegex.source}${randomNumRegex.source}$`;
    const regex = new RegExp(pattern);
    return regex.test(url)
}

module.exports = {validateEmail,validatePassword,validateUrl,validateShortUrl}