const GetExtension = (url:String) => {
    let temp =  url?.split('.')?.pop();
    return `.${temp}`
}
export default GetExtension