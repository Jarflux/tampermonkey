// ==UserScript==
// @name         Inject EPC QR Codes
// @namespace    http://tampermonkey.net/
// @version      2024-09-03
// @description  In Yuki SEPA paymentdocument view add Payment QR codes for each payment in the list. QR codes are generated on page view and are limited to 100 per IP per day.
// @author       Ben Oeyen
// @match        https://*.yukiworks.be/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yuki.be
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.slim.min.js
// ==/UserScript==

/* globals jQuery, $, navigation */

(function () {
    'use strict';

    onUrlChange();

    if (self.navigation) {
        navigation.addEventListener('navigatesuccess', onUrlChange);
    } else {
        let u = location.href;
        new MutationObserver(() => u !== (u = location.href) && onUrlChange()).observe(document, {subtree: true, childList: true});
    }

    function onUrlChange() {
        if (!location.pathname.startsWith('/domain/bank/payment-file')) {
            //console.log("Script - Hibernate");
            return;
        }
        console.log('Inject EPC QR Codes Script - Actived', location.href);
        waitForElement('.u-w100 tr[data-testid]', process);
    }

    function waitForElement(elementPath, callBack){
        window.setTimeout(function(){
            if($(elementPath).length){
                callBack(elementPath, $(elementPath));
            }else{
                //console.log("Waiting")
                waitForElement(elementPath, callBack);
            }
        },500)
    }

    function process(reportTable) {
        document.querySelectorAll('.u-w100 tr[data-testid]').forEach(function(paymentRow){
            //console.log(paymentRow)
            var iban = getIBAN(paymentRow);
            var name = getPaymentToName(paymentRow);
            var amount = getAmount(paymentRow);
            var structuredPaymentId = getStructuredPaymentId(paymentRow);
            //console.log("iban:" + iban + "|name:" + name + "|amount:" + amount + "|msg:" + structuredPaymentId);
            var qRcodeUrl = getQRCodeUrl(iban, name, amount, structuredPaymentId)
            //console.log(qRcodeUrl)
            addQRCodeButton(paymentRow, qRcodeUrl)
        });
    }

    //Create function to show modal containing QR code from URL.
    function addQRCodeButton(paymentRow, qRcodeUrl){
        var qrCodeDiv = document.createElement('div');

        //qRcodeUrl = "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
        $(qrCodeDiv).on( "mouseenter", function() {
            //console.log("Mouse enter");
            qrCodeDiv.querySelector('.popover').style.display = "block";
        })
        $(qrCodeDiv).on( "mouseleave", function() {
            //console.log("Mouse leave");
            qrCodeDiv.querySelector('.popover').style.display = "none";
        })

        qrCodeDiv.innerHTML = "<div class=\"qr-code-icon\" title=\"QR Code\"><span><i class=\"yi yi-grid\"></i></span><div class=\"popover\" style=\"position:fixed;width:300px;height:300px;padding:15px;border:solid;transform:translate(-150px,-330px);background:white;display:none;\"><img src=\"" + qRcodeUrl + "\"/></div></div>"
        paymentRow.querySelector('td[data-testid="report-column-documentType"]').style.zIndex = 12;
        paymentRow.querySelector('td[data-testid="report-column-documentType"] .report-cell-content').appendChild(qrCodeDiv);
    }

   function getIBAN(paymentRow){
       return paymentRow.querySelector('td[data-testid="report-column-iban"] .report-cell-content div').innerHTML;
   }

   function getPaymentToName(paymentRow){
       return paymentRow.querySelector('td[data-testid="report-column-paymentTo"] .report-cell-content div').innerHTML;
   }

   function getAmount(paymentRow){
       return paymentRow.querySelector('td[data-testid="report-column-documentInvoiceAmount"] .report-cell-content div').innerHTML;
   }

   function getStructuredPaymentId(paymentRow){
       return paymentRow.querySelector('td[data-testid="report-column-structuredPaymentId"] .report-cell-content div').innerHTML;
   }

   function getQRCodeUrl(iban, name, amount, structuredPaymentId){
      return encodeURI("https://epc-qr.eu/?iban="+iban+"&bname="+name+"&euro="+amount+"&bba="+structuredPaymentId+"&logo=none&color=blue&ver=2")
   }

})();
