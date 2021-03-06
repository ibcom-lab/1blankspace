/*!
 * ibCom Pty Ltd ATF ibCom Unit Trust & contributors
 * Licensed as Attribution-ShareAlike 4.0 International
 * http://creativecommons.org/licenses/by-sa/4.0/
 *
 * https://developer.yodlee.com
 */

"use strict";

if (ns1blankspace === undefined) {var ns1blankspace = {}}
if (ns1blankspace.util === undefined) {ns1blankspace.util = {}}
if (ns1blankspace.util.financial === undefined) {ns1blankspace.util.financial = {}}

ns1blankspace.util.financial.bankAccounts =
{
	link: 
	{
		data:
		{
			userID: '1d85277b-e8ec-434a-92e3-84e8c1449128',
			role:
			{
				title: 'Yodlee',
				methods:
				[
					{
						title: 'FINANCIAL_BANK_ACCOUNT_SEARCH',
						accessmethod: '340',
						canadd: 'N',
						canremove: 'N',
						canupdate: 'N',
						canuse: 'Y'
					},
					{
						title: 'FINANCIAL_BANK_ACCOUNT_TRANSACTION_SOURCE_SEARCH',
						accessmethod: '632',
						canadd: 'N',
						canremove: 'N',
						canupdate: 'N',
						canuse: 'Y'
					},
					{
						title: 'FINANCIAL_BANK_ACCOUNT_TRANSACTION_SEARCH',
						accessmethod: '629',
						canadd: 'N',
						canremove: 'N',
						canupdate: 'N',
						canuse: 'Y'
					},
					{
						title: 'FINANCIAL_BANK_ACCOUNT_TRANSACTION_SOURCE_MANAGE',
						accessmethod: '633',
						canadd: 'Y',
						canremove: 'Y',
						canupdate: 'Y',
						canuse: 'N'
					},
					{
						title: 'FINANCIAL_BANK_ACCOUNT_TRANSACTION_MANAGE',
						accessmethod: '635',
						canadd: 'Y',
						canremove: 'Y',
						canupdate: 'Y',
						canuse: 'N'
					}
				]
			}
		},

		init:  function (oParam, oResponse)
		{
			if (oResponse == undefined)
			{
				var oSearch = new AdvancedSearch();
				oSearch.method = 'SETUP_EXTERNAL_USER_ACCESS_SEARCH';     
				oSearch.addField('createddate,etag,guid');
				oSearch.addFilter('userlogon', 'EQUAL_TO', 'yodlee-enterprise-service@mydigitalstructure.cloud');
				oSearch.getResults(function(data) {ns1blankspace.util.financial.bankAccounts.link.init(oParam, data)});
			}
			else
			{
				var sXHTMLElementID = ns1blankspace.util.getParam(oParam, 'xhtmlElementID', {"default": 'ns1blankspaceSummaryColumn2AccountLinking'}).value;
				var aHTML = [];

				aHTML.push('<table class="ns1blankspace">');

				aHTML.push('<tr><td class="ns1blankspaceHeaderCaption">TRANSACTION IMPORTING</td></tr>');

				if (oResponse.data.rows.length != 0)
				{
					aHTML.push('<tr><td class="ns1blankspaceSubNote" style="padding-top:6px;">You have automatic bank transaction importing enabled.</td></tr>');

					aHTML.push('<tr><td class="ns1blankspaceAction" style="font-size:0.625em; padding-top:12px;"><span id="ns1blankspaceSetupFinancialsBankingLinkingDisable" data-id="' + oResponse.data.rows[0].id + '">Disable</span></td></tr>');

					aHTML.push('<tr><td class="ns1blankspaceAction" style="font-size:0.625em; padding-top:12px;"><span id="ns1blankspaceSetupFinancialsBankingLinkingAccounts" data-id="' + oResponse.data.rows[0].id + '">Link Accounts</span></td></tr>');

					aHTML.push('<tr><td class="ns1blankspaceSubNote" style="padding-top:12px;">When you click this button a Yodlee webpage will open and you can then add your banking credentials.  Once complete, just close it and come back to this page.</td></tr>');

					aHTML.push('<tr><td class="ns1blankspaceSubNote" style="padding-top:12px;">Bank transactions will then start to be imported into your space, it can take up to 24 hours for the importing start.  You can view the transactions in the "Import" section of any matching bank accounts you have setup in this space.</td></tr>');

					aHTML.push('<tr><td class="ns1blankspaceAction" style="font-size:0.625em; padding-top:12px;"><div id="ns1blankspaceSetupFinancialsBankingLinkingAccountsContainer"></div></td></tr>');
				}
				else
				{
					aHTML.push('<tr><td class="ns1blankspaceSubNote" style="padding-top:6px;">If you use one of the following providers to manage your bank accounts, you can get transactions automatically imported into your space;</td></tr>');

					aHTML.push('<tr><td class="ns1blankspaceSubNote"><ul><li>Westpac<li>St George<li>NAB<li>ANZ<li>CBA<li>AMEX (Australia)</ul></td></tr>');

					aHTML.push('<tr><td class="ns1blankspaceSubNote">The transactions are imported using the <a href="yodlee.com" target="_blank">Yodlee</a> service and at no time do we have access to your online bank credentials.</td></tr>');

					aHTML.push('<tr><td class="ns1blankspaceAction" style="font-size:0.625em; padding-top:12px;"><span id="ns1blankspaceSetupFinancialsBankingLinkingEnable">Enable</span></td></tr>');
				}

				$('#' + sXHTMLElementID).html(aHTML.join(''));

				$('#ns1blankspaceSetupFinancialsBankingLinkingEnable').button(
				{
					label: "Enable"
				})
				.click(function()
				{
					ns1blankspace.util.financial.bankAccounts.link.enable();
				});

				$('#ns1blankspaceSetupFinancialsBankingLinkingDisable').button(
				{
					label: "Disable"
				})
				.click(function()
				{
					var sID = $(this).attr('data-id');
					ns1blankspace.util.financial.bankAccounts.link.disable({id: sID});
				});

				$('#ns1blankspaceSetupFinancialsBankingLinkingAccounts').button(
				{
					label: "Link bank accounts using Yodlee"
				})
				.click(function()
				{
					ns1blankspace.util.financial.bankAccounts.link.accounts.init();
				});   
			}
		},

		disable: function (oParam, oResponse)
		{
			var sID = ns1blankspace.util.getParam(oParam, 'id').value;

			ns1blankspace.status.working();

			var oData =
			{
				remove: 1,
				id: sID
			}

			$.ajax(
			{
				type: 'POST',
				url: ns1blankspace.util.endpointURI('SETUP_EXTERNAL_USER_ACCESS_MANAGE'),
				data: oData,
				dataType: 'json',
				success: function()
				{
					ns1blankspace.util.financial.bankAccounts.link.init();
					ns1blankspace.status.message('Disabled');
				}
			});
 		},

		enable: function (oParam, oResponse)
		{			
			if (ns1blankspace.util.financial.bankAccounts.link.data.userID != undefined)
			{
	            if (oResponse == undefined)
				{
					var oSearch = new AdvancedSearch();
					oSearch.method = 'SETUP_EXTERNAL_USER_ACCESS_SEARCH';     
					oSearch.addField('createddate,etag,user,guid');
					oSearch.addFilter('userlogon', 'EQUAL_TO', 'yodlee-enterprise-service@mydigitalstructure.cloud');
					oSearch.getResults(function(data) {ns1blankspace.util.financial.bankAccounts.link.enable(oParam, data)});
				}
				else
				{
					$('#ns1blankspaceSummaryColumn2AccountLinking').html('<div class="ns1blankspaceSub">Enabling the Yodlee service...</div>');

					if (oResponse.data.rows.length == 0)
					{
						var oData =
						{
							userguid: ns1blankspace.util.financial.bankAccounts.link.data.userID,
							type: 5,
							unrestrictedaccess: 'N',
							targetuser: ns1blankspace.user.id,
							datareturn: 'user,guid'
						}

						$.ajax(
						{
							type: 'POST',
							url: ns1blankspace.util.endpointURI('SETUP_EXTERNAL_USER_ACCESS_MANAGE'),
							data: oData,
							dataType: 'json',
							success: function(response)
							{
								ns1blankspace.util.financial.bankAccounts.link.data.accessGUID = response.data.rows[0].guid;
								ns1blankspace.util.financial.bankAccounts.link.data.accessUser = response.data.rows[0].user;
								ns1blankspace.util.financial.bankAccounts.link.data.accessID = response.id;
								ns1blankspace.util.financial.bankAccounts.link.access.role()
							}
						});
					}
					else
					{
						ns1blankspace.util.financial.bankAccounts.link.data.access = response.data.rows[0];
						ns1blankspace.util.financial.bankAccounts.link.data.accessUser = response.data.rows[0].user;
						ns1blankspace.util.financial.bankAccounts.link.data.accessID = response.data.rows[0].id;
						ns1blankspace.util.financial.bankAccounts.link.access.role()
					}
				}
			}	
		},

 		access:
 		{
			role: function (oParam, oResponse)
			{
				if (oResponse == undefined)
				{
					var oSearch = new AdvancedSearch();
					oSearch.method = 'SETUP_ROLE_SEARCH';     
					oSearch.addField('id');
					oSearch.addFilter('title', 'EQUAL_TO', ns1blankspace.util.financial.bankAccounts.link.data.role.title);
					oSearch.getResults(function(data) {ns1blankspace.util.financial.bankAccounts.link.access.role(oParam, data)});
				}
				else
				{
					if (oResponse.data.rows.length != 0)
					{
						ns1blankspace.util.financial.bankAccounts.link.data.role.id = oResponse.data.rows[0].id;
						ns1blankspace.util.financial.bankAccounts.link.access.finalise();
					}
					else
					{
						var oData =
						{
						title: ns1blankspace.util.financial.bankAccounts.link.data.role.title
						}

						$.ajax(
						{
							type: 'POST',
							url: ns1blankspace.util.endpointURI('SETUP_ROLE_MANAGE'),
							data: oData,
							dataType: 'json',
							success: function(response)
							{
								ns1blankspace.util.financial.bankAccounts.link.data.role.id = response.id;
								ns1blankspace.util.financial.bankAccounts.link.access.methods();
							}
						});
					}   
				} 
			},

			methods: function (oParam)
			{
				var iMethodIndex = ns1blankspace.util.getParam(oParam, 'methodIndex', {"default": 0}).value;

				if (iMethodIndex < _.size(ns1blankspace.util.financial.bankAccounts.link.data.role.methods))
				{
					var oData = ns1blankspace.util.financial.bankAccounts.link.data.role.methods[iMethodIndex];
					oData.role = ns1blankspace.util.financial.bankAccounts.link.data.role.id;

					$.ajax(
					{
						type: 'POST',
						url: ns1blankspace.util.endpointURI('SETUP_ROLE_METHOD_ACCESS_MANAGE'),
						data: oData,
						dataType: 'json',
						success: function(response)
						{
							iMethodIndex++;
							ns1blankspace.util.financial.bankAccounts.link.access.methods({methodIndex: iMethodIndex});
						}
					});
				}
				else
				{
					ns1blankspace.util.financial.bankAccounts.link.access.finalise()
				}
			},

			finalise: function ()
			{
				var oData =
				{
					user: ns1blankspace.util.financial.bankAccounts.link.data.accessUser,
					role: ns1blankspace.util.financial.bankAccounts.link.data.role.id
				}

				$.ajax(
				{
					type: 'POST',
					url: ns1blankspace.util.endpointURI('SETUP_USER_ROLE_MANAGE'),
					data: oData,
					dataType: 'json',
					success: function(response)
					{
						ns1blankspace.util.financial.bankAccounts.link.register.init();
						ns1blankspace.status.message('Enabled');
					}
				});
			}
		},

		register:
		{
			init: function (oParam, oResponse)
			{
				if (oResponse == undefined)
				{
					var oSearch = new AdvancedSearch();
					oSearch.method = 'SETUP_EXTERNAL_USER_ACCESS_SEARCH';     
					oSearch.addField('createddate,etag');
					oSearch.addFilter('userlogon', 'EQUAL_TO', 'Yodlee');
					oSearch.getResults(function(data) {ns1blankspace.util.financial.bankAccounts.link.register.init(oParam, data)});
				}
				else
				{
					if (oResponse.data.rows.length != 0)
					{
						var sYodleeProxyURL = 'https://yodlee.mydigitalstructure.cloud';
						//var sYodleeProxyURL = 'https://rx33mxfq7e.execute-api.ap-southeast-2.amazonaws.com/default/'

						if (ns1blankspace.option._yodlee != undefined)
						{
							if (ns1blankspace.option.yodlee.proxyURL != undefined)
							{
								sYodleeProxyURL = ns1blankspace.option.yodlee.proxyURL
							}    
						}

						$.ajax(
						{
							type: 'POST',
							url: sYodleeProxyURL,
							dataType: 'json',
							global: false,
							cors: true,
							contentType: 'application/json',
							data: JSON.stringify({	
								method: 'user-register',
								apikey: ns1blankspace.util.financial.bankAccounts.link.data.accessGUID
							}),
							success: function(data)
							{
								console.log(data);
								ns1blankspace.util.financial.bankAccounts.link.init();
							},
							error: function (data)
							{
								console.log(data)
							}
						});
					}    
				}
			}
		},

		accounts:
		{
			init: function (oParam, oResponse)
			{
				if (oResponse == undefined)
				{
					var oSearch = new AdvancedSearch();
					oSearch.method = 'SETUP_EXTERNAL_USER_ACCESS_SEARCH';     
					oSearch.addField('createddate,etag,guid');
					oSearch.addFilter('userlogon', 'EQUAL_TO', 'yodlee-enterprise-service@mydigitalstructure.cloud');
					oSearch.getResults(function(data) {ns1blankspace.util.financial.bankAccounts.link.accounts.init(oParam, data)});
				}
				else
				{
					if (oResponse.data.rows.length != 0)
					{
						ns1blankspace.util.financial.bankAccounts.link.data.accessGUID = oResponse.data.rows[0].guid;
						ns1blankspace.util.financial.bankAccounts.link.data.accessUser = oResponse.data.rows[0].user;
						ns1blankspace.util.financial.bankAccounts.link.data.accessID = oResponse.id;

						var sYodleeProxyURL = 'https://yodlee.mydigitalstructure.cloud';
						
						$.ajax(
						{
							type: 'POST',
							url: sYodleeProxyURL,
							dataType: 'json',
							global: false,
							cors: true,
							contentType: 'application/json',
							data: JSON.stringify({	
								method: 'user-access-tokens',
								apikey: ns1blankspace.util.financial.bankAccounts.link.data.accessGUID
							}),
							success: function(data)
							{
								ns1blankspace.util.financial.bankAccounts.link.data.accessToken = data.accessToken;

								ns1blankspace.util.financial.bankAccounts.link.accounts.show(
								{
									token: data.accessToken
								});
							}
						});
					}    
				}
			},

			show: function (oParam)
			{
				// https://cdn.yodlee.com/fastlink/v4/initialize.js
				// https://developer.yodlee.com/docs/fastlink/4.0/getting-started
				// Config @ https://developer.yodlee.com/fastlink-experience-new?env=development

				$('#ns1blankspaceSummaryColumn1').html('');

				//Dev: https://fl4.preprod.yodlee.com.au/authenticate/ANZDevexPreProd-288/fastlink/?channelAppName=anzdevexpreprod
				//Prod: https://fl4.prod.yodlee.com.au/authenticate/ANZDevexProd-17/fastlink/?channelAppName=anzdevexprod

				window.fastlink.open(
				{
					fastLinkURL: 'https://fl4.prod.yodlee.com.au/authenticate/ANZDevexProd-17/fastlink/?channelAppName=anzdevexprod',
					accessToken: 'Bearer ' + ns1blankspace.util.financial.bankAccounts.link.data.accessToken,
					params:
					{
						configName : 'Aggregation'
					},
					onSuccess: function (data)
					{
					// will be called on success. For list of possible message, refer to onSuccess(data) Method.
						console.log(data);
					},
					onError: function (data)
					{
					// will be called on error. For list of possible message, refer to onError(data) Method.
					console.log(data);
					},
					onClose: function (data)
					{
					// will be called called to close FastLink. For list of possible message, refer to onClose(data) Method.
						ns1blankspace.util.financial.bankAccounts.link.data.fastlink = data;

						if (_.isArray(ns1blankspace.util.financial.bankAccounts.link.data.fastlink.sites))
						{
							$('#ns1blankspaceSummaryColumn1').html(ns1blankspace.util.financial.bankAccounts.link.data.fastlink.sites.length + ' link(s) added.');
						}
						else
						{
							$('#ns1blankspaceSummaryColumn1').html('No link(s) added.');
						}
					},
					onEvent: function (data)
					{
					// will be called on intermittent status update.
						console.log(data);
					}
				},
				'ns1blankspaceSummaryColumn1');
					  
				/* var sXHMTLElementID = ns1blankspace.util.getParam(oParam, 'xhtmlElementID', {"default": 'ns1blankspaceSetupFinancialsBankingLinkingAccountsContainer'}).value;

				var bUseFrame = ns1blankspace.util.getParam(oParam, 'xhtmlElementID', {"default": false}).value;

				ns1blankspace.status.working('Initialising...');

				var aHTML = [];

				aHTML.push('<form action="https://development-node.yodlee.com.au/authenticate/ANZDevexPreProd-288/?channelAppName=anzdevexpreprod" method="post"' +
								' name="ns1blankspaceLinkApp" id="ns1blankspaceLinkApp" target="ns1blankspaceBankAccountLinkingContainer" style="display: none">' +
								' <input type="text" name="app" id="finappId" value="10003600" />' +
								' <input type="text" name="redirectReq" value="true" />' +
								' <input type="text" name="rsession" id="rsession" value="' + oParam.userSession + '" />' +
								' <input type="text" name="token" value="' + oParam.token + '" id="token" />' +
								' <input type="text" name="extraParams" id="extraParams" value=""/>' +
							'</form>');

				if (bUseFrame)
				{
					aHTML.push('<div style="width:100%">' +
								'<iframe name="ns1blankspaceBankAccountLinkingContainer" ' +
								'id="ns1blankspaceBankAccountLinkingContainer" frameborder="0" border="0" scrolling="auto"' +
								' style="min-height:800px; width:90%;"></iframe></div>');
				}

				$('#' + sXHMTLElementID).html(aHTML.join(''));
			
				document.getElementById('ns1blankspaceLinkApp').submit();
 */
				ns1blankspace.status.clear();
			}
		}
		
	},   

   test:   function ()
   {
     /*

     <form action="https://quickstartaunode.yodlee.com.au/authenticate/quickstarta3/?channelAppName=quickstartau" method="POST"><input type="text" name="app" value="10003600" /><input type="text" name="rsession" value="04062017_0:c143c88e61db2e09c1fdf2ceae86d49f22a12544c814c0f28a7fa49d3dece7e2ac7cfae3e7e5d62cfd171e6224cdddeef0d7f068010515917b67922f8fbacd15"/><input type="text" name="token" value="35f9e47d8a7d88c1439b67c11f6df362a32d6f49ed897c4172f574eddd992e2f"/><input type="text" name="redirectReq" value="true"/><input type="submit" name="submit" /></form>

     ns1blankspace.util.financial.bankAccounts.link({}, {userSession: '04062017_1:294182dcbbc6dc26e377416de2594730967d4965f49ec0c9f8bb827d8a3830ce809aa663d94476560d5ebe023ab711cdf7592da7652a6243e1d8198e9270bd54', appToken: 'f654a91d86475679b295ce28a2b7a591001c9f6c3510bbf96aa8dd8cf9192f8e'}) 

     lambda-local -f app.js -c settings-private.json -e event-user-accesstokens.json

     ns1blankspace.util.financial.bankAccounts.link.show({},
     {
     userSession: '04062017_0:337de4145a7f8a22c64267869aa75db84febb1c33de7d6050fc8d7ed29c39a0b708baef3a4e6fd9ef623e08b43390f5bc0ed1b6af7b6d5bc684e6428d4ce5ad8',
     appToken: '6904683be6960bf4ef1d259315284d005582c000a0a5718d8488e836d2331b7c'
     })

     */
   }              
}