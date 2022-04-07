https://app.mydigitalstructure-lab.cloud
https://app-next.mydigitalstructure-lab.cloud

update OBMS_FinancialAccountType set value = 'Outgoing (Expense)' where typeid = 1


# Payroll:

## Single Touch

---

Single Touch Development <tech@singletouch.com.au>
Wed, 25 Aug 2021, 16:26
to Single, bcc: me

Good afternoon Single Touch clients

As you all know, Single Touch phase 2 is looming and it is required for you to switch to the new Phase 2 format by 1st January 2022

So if you haven't already started, now is certainly the time to start planning and implementing the new Json or XML format.
Details are on the sandbox support pages.
https://sandbox.singletouch.com.au/Support

When you are ready to test, it is required that you do conformance testing with the ATO before they will whitelist your product for STP Phase 2.
You must get in touch with the ATO via the Online Services for DSPs website
https://developer.sbr.gov.au/portal/servicedesk

There is a link to "Develop a Product" and then click "STP Phase 2 Extended Conformance Testing".

If you do not have access to the Online Services for DSPs website, please get in touch with the ato on dpo@ato.gov.au and they should be able to help. 

If you have any questions, please do not hesitate to get in touch.


Cheers
Lasse
Single Touch Pty Ltd
https://singletouch.com.au

---

## Data specs:

https://sandbox.singletouch.com.au/Support/APIEndpoints

https://softwaredevelopers.ato.gov.au/STPphase2BIG

## Endpoints:

https://sandbox-api.singletouch.com.au/api/STPEvent2020
https://api.singletouch.com.au/api/STPEvent2020

## Data model:

https://sandbox.singletouch.com.au/Support/STPEventViewModel2020

## myds Data:

var oSearch = new AdvancedSearch();
oSearch.method = 'SETUP_FINANCIAL_PAYROLL_LINE_TYPE_SEARCH';		
oSearch.addField('includeinallowancesnontaxable,includeinallowancestaxable,includeindeductions,includeingrosssalary,' +
                    'includeinleave,includeinleaveloading,includeinleavetype,includeinleavetypetext,includeinposttaxsuper,' +
                    'includeinsalarysacrificesuper,includeinstandardhours,includeinsuper,includeintaxadjustments,notes,title,fixed');
oSearch.rows = 100;
oSearch.sort('title', 'asc');
oSearch.getResults(function(oResponse)
{
    ns1blankspace.setup.financial.payroll.data.linetypes = oResponse.data.rows;
    ns1blankspace.setup.financial.payroll.linetypes.show(oParam);
});

## myds Functional updates

FINANCIAL_PAYROLL_EMPLOYEE_MANAGE

- type:
[F/P/C/L/V/D/N]

- terminationType:
[V/I/D/R/F/C/T]


## ATO Testing etc
https://softwaredevelopers.ato.gov.au/OnlineservicesforDSPs
https://mail.google.com/mail/u/0/#inbox/FMfcgzGmvLNPSXFDZXPFTLbqnlszTGSG

Replacement EVTE ID - 71935 

https://singletouch.b2clogin.com/singletouch.onmicrosoft.com/b2c_1_singletouch/oauth2/v2.0/authorize?response_type=token&scope=https%3A%2F%2Fsingletouch.onmicrosoft.com%2Fmydigitalstructure%2Fread%20https%3A%2F%2Fsingletouch.onmicrosoft.com%2Fmydigitalstructure%2Fuser_impersonation%20openid%20profile&client_id=198014d6-e28f-4835-b02e-1e5005df667d&redirect_uri=https%3A%2F%2Fmsal.mydigitalstructure.cloud%2F&state=eyJpZCI6ImFmMjc2NzQwLTM2OWQtNGMyZC04ZjcyLWRlZjI4MWY5NTRjYSIsInRzIjoxNjQ5MjIzMzM3LCJtZXRob2QiOiJwb3B1cEludGVyYWN0aW9uIn0%3D&nonce=dd408ca5-22e4-4e48-9881-097b309b9973&client_info=1&x-client-SKU=MSAL.JS&x-client-Ver=1.4.4&client-request-id=a5220b3a-80a5-4702-9629-f4ae9cd34d24&response_mode=fragment









