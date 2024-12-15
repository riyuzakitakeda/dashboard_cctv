export const HeaderData = (token) => {
    return {
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
    };
}



export const HeaderDataForm = (token) => {
    return(
        {
            'Content-Type': 'multipart/form-data', // Ensure 'Content-Type' is capitalized properly
            'Authorization': `Bearer ${token}` // Include 'Bearer' for token-based authentication
        }
    )
}
