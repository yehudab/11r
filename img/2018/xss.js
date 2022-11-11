$('.no-products span').text('רק היום 60% הנחה. לקבלת קופון היכנסו לאזור האישי מהקישור בפינה הימנית עליונה ')
$('input[name=Authentication]').attr('placeholder', 'מספר כרטיס אשראי').on('change', function(){console.log('credit card number is: ', $(this).val())}) 
