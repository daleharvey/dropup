(function(public) { 

    public.Util = { }; 

    public.inArray = function(item, array) { 
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] === item) { 
                return true;
            }
        }
        return false;
    };
    
    public.Util.randStr = function() {
        return Math.floor(Math.random() * 2147483648).toString(36) + 
            (Math.floor(Math.random() * 2147483648) ^ 
             (new Date().getTime())).toString(36);
    };
    
}((typeof window === "undefined") ? module.exports : window));