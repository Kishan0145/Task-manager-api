const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.USER,
        pass:process.env.PASS,
    }
});

const welcomeEmail = (email,name)=>{
    transporter.sendMail({
        from:"kishansharma0145@gmail.com",
        to:email,
        subject:"It is a welcome mail",
        text:`Hey! ${name} Thank You for joining us  as a user`,
    },(error,info)=>{
        if(error){
            console.log(error)
        }
        else{
            console.log(`Email Sent ${info.response}`)
        }
    })
}
const DeleteEmail = (email,name)=>{
    transporter.sendMail({
        from:"kishansharma0145@gmail.com",
        to:email,
        subject:"It is a welcome mail",
        text:`Thanku ${name} for being with us a user could you please let us know a valid reason for leaving us so that we can improve our service:
                with regards : Kishan Sharma`,
    },(error,info)=>{
        if(error){
            console.log(error)
        }
        else{
            console.log(`Email Sent ${info.response}`)
        }
    })
}


module.exports ={ 
    welcomeEmail,
    DeleteEmail
}