const Artist = require('../models/artisan');
const User = require ('../models/user');

exports.isArtist = async (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(403).json({ message: 'You are not authorized to access this page' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const artist = await Artist.findById(decoded.id);
        if (!artist) {
            return res.status(403).json({ message: 'You are not authorized to access this page' });
        }
        req._id = decoded.id;
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    // let email = req.body.email;
    // let password = req.body.password;
    // try {
    //     const artist = await Artist.find({email})
    //     if (!artist) {
    //         return res.status(403).json({ message: 'You are not authorized to access this page' });
    //     }
    //     const isMatch = await bcrypt.compare(password, artist.password);
    //     if (!isMatch) {
    //         return res.status(403).json({ message: 'You are not authorized to access this page' });
    //     }
    //     req._id = artist._id;
    //     next();
}


exports.isUser = async (req, res)=>{
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(403).json({ message: 'You are not authorized to access this page' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(403).json({ message: 'You are not authorized to access this page' });
        }
        req._id = decoded.id;
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}