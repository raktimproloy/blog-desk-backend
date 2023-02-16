const createOtp = (req, res, next) => {
    const number = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const otp = ""
    try{
        for (let i = 0; i < 6; i++) {
            otp =  otp + number[i]
        }
        req.otp = otp
        next()
    }
    catch{
        next("Otp error")
    }
    
}
module.exports = createOtp