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

module.exports = {validateEmail,validatePassword,validateUrl}