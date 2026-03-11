// this is a jsonwebtoken utility file
import jwt from 'jsonwebtoken';

const CreateJsonWebToken = (payload,secret,expresin) => {
    if(typeof payload !== 'object'){
        throw new Error('Payload must be an object');
    }
    if (typeof secret !== 'string' || secret=='') {
        throw new Error('Secret must be a string ');
    

    }
    try{
        const  token = jwt.sign(payload,secret,{expiresIn:expresin});
        return token;
    }
    catch(err){
        throw new Error('Error creating JSON Web Token: ' + err.message);
    }
}

export { CreateJsonWebToken };