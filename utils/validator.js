const validatePassword = (password)=>{
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);

    return hasUppercase && hasLowercase && hasDigit;
}

const validateUrl = ()=>{
    const urlRegex = /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-z0-9\-]+(?:\.[a-z0-9\-]+)+[/?#][^\s]*$/i;
}

const validateEmail = ()=>{
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
} 

module.exports = {validateEmail,validatePassword,validateUrl}