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
https://developer.sbr.gov.au/collaborate/pages/viewpage.action?pageId=185040913

### Develop a product:
https://developer.sbr.gov.au/portal/servicedesk/customer/portal/1/group/7

Replacement EVTE ID - 71935 

https://singletouch.b2clogin.com/singletouch.onmicrosoft.com/b2c_1_singletouch/oauth2/v2.0/authorize?response_type=token&scope=https%3A%2F%2Fsingletouch.onmicrosoft.com%2Fmydigitalstructure%2Fread%20https%3A%2F%2Fsingletouch.onmicrosoft.com%2Fmydigitalstructure%2Fuser_impersonation%20openid%20profile&client_id=198014d6-e28f-4835-b02e-1e5005df667d&redirect_uri=https%3A%2F%2Fmsal.mydigitalstructure.cloud%2F&state=eyJpZCI6ImFmMjc2NzQwLTM2OWQtNGMyZC04ZjcyLWRlZjI4MWY5NTRjYSIsInRzIjoxNjQ5MjIzMzM3LCJtZXRob2QiOiJwb3B1cEludGVyYWN0aW9uIn0%3D&nonce=dd408ca5-22e4-4e48-9881-097b309b9973&client_info=1&x-client-SKU=MSAL.JS&x-client-Ver=1.4.4&client-request-id=a5220b3a-80a5-4702-9629-f4ae9cd34d24&response_mode=fragment


## Tax Treatment Code:

ie R

If payees have not provided the correct information to the payer, the payer may not withhold enough tax to meet the payees’ obligations. Payees may be presented with a tax debt at the end of financial year when they complete their Individual Income Tax Return (IITR). To avoid these adverse impacts to payees, a 6-character Tax Treatment code representing these components will be mandatorily required each pay event 

This 6-character code is comprised of ATO-defined values for each character, where the first 2 characters have specific values for every payee, but characters 3-6 are specific values only if the payee notifies choices, else “X”:

Category of Tax Scale (Char 1) – that represents the tax table or schedule of withholding rates, such as Regular for the standard weekly, fortnightly, monthly or daily schedules. Categories include:
R - Regular
A - Actors
C - Horticulturists and Shearers
S - Seniors and Pensioners
H - Working Holiday Makers
W - Seasonal Worker Programme
F - Foreign Resident
N - No TFN
D - ATO-Defined
V - Voluntary Agreement.

Options (Char 2) – that represents the options per Category that may be included in the categories of tax scales, such as for Regular: Tax Free Threshold, No Tax-Free Threshold, Daily Casuals
Study Training Support Loans (Char 3) – that represents where the payee has an obligation to repay a higher rate of withholding when income thresholds are reached. This reflects any loans notified by the payee
Medicare Levy Surcharge (Char 4) – that represents additional rates of Medicare Levy imposed on those who do not have an appropriate level of private patient hospital cover and earn above a certain income. The rates are dependent upon domestic circumstances (single/family) and combined family income thresholds. This reflects payee choices
Medicare Levy Exemption (Char 5) – that represents full or half exemption from Medicare Levy for those who meet certain medical requirements; are a foreign resident; or are not entitled to Medicare benefits. This reflects payee choices
Medicare Levy Reduction (Char 6) – that represents a reduction in the rate of Medicare Levy based on family taxable income below a certain threshold and consideration of the number of dependants, if any. Claiming this variation may also absolve the payee from repayment of Study and Training Support Loans that would otherwise be payable, for the period of reduction. This reflects payee choices.

### FINANCIAL_PAYROLL_EMPLOYEE:
taxfreethreshold

Add:
- status: 'Full time', 'Part time', 'Casual', 'Labour Hire', 'Volunteer', 'Death Beneficiary', 'Non Active', 'Terminated' 
- terminationtype: 'Ill Health', 'Deceased', 'Redundancy', 'Dismissal', 'Contract Ended', 'Transfer'
- taxtreatmentcode: varchar(25)
- incometypecode: varchar(25)

Tax Offset = .taxadjustment

Download to CSV


