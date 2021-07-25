
const mongo = require("mongodb");
const uri = require("../config/keys").MongoURI;
const client = new mongo.MongoClient(uri,{ useUnifiedTopology: true });


function continue_if_user(req, res, next) {
    if(req.isAuthenticated()){
    // if user is not admin, go next
       if (req.user.is_admin == false) {
        return next();
      }
    } else{
        return res.redirect("/users/login");
    }
}

function to_dashboard_if_user(req, res, next) {
    if(req.isAuthenticated()){
        if (req.user.is_admin == true) {
            return res.redirect("/admin/dashboard");
        }else{
            return res.redirect("/dashboard");
        }
    } else{
        return next();
    }
}

function continue_if_admin(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
       // if user is admin, go next
       if (req.user.is_admin == true) {
         return next();
       }
    }else{
        return res.redirect("/users/login");
    }
}

async function get_org_list(){
    
    await client.connect();

    const database = client.db("test");
    const collection = database.collection("users");
    
    var resp_data = []
    await collection.find({"is_admin":true}).forEach(
        function(curr_resp) { 
            resp_data.push(curr_resp.organization);
        }
    );

    return resp_data;
}

module.exports = {
    continue_if_user,
    to_dashboard_if_user,
    continue_if_admin,
    get_org_list
};