/**
 * call brands route from backend to get all brands
 * helper file for api calls
 * **/

const getBrands = async () => {
    const response = await fetch('/api/brands')
    const data = await response.json()
    console.log(data)
    return data
}

export default getBrands