
function Validator(options) {
    var _this = this
    var formRules = {}

    function getParent(element, selector) {
        // Vét cạn
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }

            element = element.parentElement
        }
    }

    /** Quy ước tạo rule:
     * Nếu có lỗi thì return `error message`
     * Nếu không có lỗi thì return `undefined`
     */
    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Please enter this field!'
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'This field must be email'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Password minimum ${min} characters`
            }
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Password maximum ${max} characters`
            }
        },
        // confirmed: function (value, getConfirmValue() {
        //     return document.querySelector('#form-1 #password').value
        // }) {
        //     return function (value) {
        //         return value === getConfirmValue() ? undefined : `The value entered is incorrect`
        //     }
        // },
    }

    // Lấy ra form element trong DOM theo `options`
    var formElement = document.querySelector(options.form)

    // Chỉ xử lý khi có element trong DOM
    if (formElement) {

        // Lấy tất cả thẻ input có atrribute là rule, name
        var inputs = formElement.querySelectorAll('[name][rules]')
        for (var input of inputs) {

            var rules = input.getAttribute('rules').split('|')
            for (var rule of rules) {
                var ruleInfo
                var isRuleHasValue = rule.includes(':')

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                }

                var ruleFunc = validatorRules[rule]
                
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }

            // Lắng nghe sự kiện để validate (blur, change, ...)
            input.onblur = handleValidate
            input.oninput = handleClearError
        }

        // Hàm thực hiện validate
        function handleValidate(event) {
            var rules = formRules[event.target.name]
            var errorMessage

            for (var rule of rules) {
                errorMessage = rule(event.target.value)
                if (errorMessage) break
            }

            // Nếu có error thì hiển thị message
            if (errorMessage) {
                var formGroup = getParent(event.target, options.formGroupSelector)
                if (formGroup) {
                    formGroup.classList.add('invalid')
                    var formMessage = formGroup.querySelector(options.errorSelector)
                    if (formMessage) {
                        formMessage.innerText = errorMessage
                    }
                }
            }

            return !errorMessage
        }

        // Hàm clear error message
        function handleClearError(event) {
            var formGroup = getParent(event.target, options.formGroupSelector)

            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')
                var formMessage = formGroup.querySelector(options.errorSelector)

                if (formMessage) {
                    formMessage.innerText = ''
                }
            }
        }


        // Xử lý hành vi submit form
        formElement.onsubmit = function (event) {
            event.preventDefault()

            var isValid = true

            // Lặp qua từng rule và validate
            for (var input of inputs) {
                var handleValidateCondition = handleValidate({ target: input })
                if (!handleValidateCondition) {
                    isValid = false
                }
            }

            // Khi không có lỗi thì submit form
            if (isValid) {
                // fix
                if (typeof _this.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch(input.type) {
                            case 'radio':
                            case 'checkbox':
                                values[input.name] = formElement.querySelector(`input[name="${input.name}"]:checked`).value
                                break
                            default:
                                values[input.name] = input.value
                        }

                        return values
                    }, {})

                    _this.onSubmit(formValues)
                } else {
                    formElement.submit()
                }
            }
        }
    }
}