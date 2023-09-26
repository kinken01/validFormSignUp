
function Validator(formSelector) {
    const formRules = {}

    // Lấy ra form element trong DOM `formSelector`
    const formElement = document.querySelector(formSelector)
    console.log('formElement :', formElement);

    // Chỉ xử lý khi có element trong DOM
    if(formElement) {
        const inputs = formElement.querySelectorAll('[name][rules]')
        
        for(const input of inputs) {
            console.log(input.getAttribute('rules'))
        }
    }

}