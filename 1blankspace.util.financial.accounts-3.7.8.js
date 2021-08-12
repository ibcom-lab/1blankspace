/*!
 * ibCom Pty Ltd ATF ibCom Unit Trust & contributors
 * Licensed as Attribution-ShareAlike 4.0 International
 * http://creativecommons.org/licenses/by-sa/4.0/
 *
 * Set up the default financial accounts
 * See ns1blankspace.financial.initData()
 
 *
 */

"use strict";

if (ns1blankspace === undefined) {var ns1blankspace = {}}
if (ns1blankspace.util === undefined) {ns1blankspace.util = {}}
if (ns1blankspace.util.financial === undefined) {ns1blankspace.util.financial = {}}

ns1blankspace.util.financial.accounts =
{
	data:
	{
		defaults:
		{
			root:
			{
				title: '[Financial Accounts]'
			},
			typeRoots: []
		},
		accounts:
		{
			root: {},
			typeRoots: []
		}
	},

	//ns1blankspace.util.financial.accounts.init(oParam, data)

	init: function (oParam, oResponse)
	{
		if (oResponse == undefined)
		{
			var oSearch = new AdvancedSearch();
			oSearch.method = 'SETUP_FINANCIAL_ACCOUNT_SEARCH';
			oSearch.addField('title');
			oSearch.addFilter('title', 'EQUAL_TO', ns1blankspace.util.financial.accounts.data.defaults.root.title);
			oSearch.getResults(function(data)
			{
				ns1blankspace.util.financial.accounts.init(oParam, data);
			});
		}
		else
		{	
			if (oResponse.data.rows.length == 0)
			{
				var oData =
				{
					code: '-',
					title: ns1blankspace.util.financial.accounts.data.defaults.root.title,
					postable: 'N'
				}

				// remove type when method updated.

				$.ajax(
				{
					type: 'POST',
					url: ns1blankspace.util.endpointURI('SETUP_FINANCIAL_ACCOUNT_MANAGE'),
					data: oData,
					dataType: 'json',
					success: function(data)
					{
						ns1blankspace.util.financial.accounts.init(oParam);
					}
				});	
			}
			else
			{
				ns1blankspace.util.financial.accounts.data.accounts.root.id = oResponse.data.rows[0].id;
				ns1blankspace.util.financial.accounts.types(oParam);
			}
		}
	},

	types: function (oParam, oResponse)
	{
		if (oResponse == undefined)
		{
			var oSearch = new AdvancedSearch();
			oSearch.method = 'SETUP_FINANCIAL_ACCOUNT_TYPE_SEARCH';
			oSearch.addField('title');			
			oSearch.getResults(function(data) {ns1blankspace.util.financial.accounts.types(oParam, data)});
		}
		else
		{
			ns1blankspace.util.financial.accounts.data.defaults.typeRoots = oResponse.data.rows;
			ns1blankspace.util.financial.accounts.setup.typeRoots(oParam);
		}
	},

	setup:
	{
		typeRoots: function (oParam, oResponse)
		{
			if (ns1blankspace.util.financial.accounts.data.accounts.root.id == undefined)
			{
				console.log('!!ERROR: No root account; run: ns1blankspace.util.financial.accounts.init()');
			}
			else
			{
				if (oResponse == undefined)
				{
					var oSearch = new AdvancedSearch();
					oSearch.method = 'SETUP_FINANCIAL_ACCOUNT_SEARCH';
					oSearch.addField('title,type');
					oSearch.addFilter('parentaccount', 'EQUAL_TO', ns1blankspace.util.financial.accounts.data.accounts.root.id )	
					oSearch.getResults(function(data) {ns1blankspace.util.financial.accounts.setup.typeRoots(oParam, data)});
				}
				else
				{
					ns1blankspace.util.financial.accounts.data.accounts.typeRoots = oResponse.data.rows;
					
					$.each(ns1blankspace.util.financial.accounts.data.defaults.typeRoots, function (t, defaultType)
					{
						defaultType._account = $.grep(ns1blankspace.util.financial.accounts.data.accounts.typeRoots,
								function (accountType) {return accountType.title == '[' + defaultType.title + ']' })
					});

					ns1blankspace.util.financial.accounts.setup.process(oParam);
				}
			}
		},

		process: function (oParam, oResponse)
		{
			ns1blankspace.util.financial.accounts.data.processTypeRoots = $.grep(ns1blankspace.util.financial.accounts.data.defaults.typeRoots,
				function (defaultType) {return defaultType._account.length == 0 });

			if (ns1blankspace.util.financial.accounts.data.processTypeRoots.length == 0)
			{
				ns1blankspace.util.onComplete(oParam);
			}
			else
			{
				ns1blankspace.util.financial.accounts.setup.save(oParam)
			}
		},

		save: function (oParam, oResponse)
		{
			var iProccessTypeIndex = ns1blankspace.util.getParam(oParam, 'index', {default: 0}).value;
			
			var oProccessType = ns1blankspace.util.financial.accounts.data.processTypeRoots[iProccessTypeIndex];

			var oData =
			{
				code: '',
				title: '[' + oProccessType.title + ']',
				type: oProccessType.id,
				parentaccount: ns1blankspace.util.financial.accounts.data.accounts.root.id,
				postable: 'N'
			}

			$.ajax(
			{
				type: 'POST',
				url: ns1blankspace.util.endpointURI('SETUP_FINANCIAL_ACCOUNT_MANAGE'),
				data: oData,
				dataType: 'json',
				success: function(data)
				{
                    if (data.status == 'ER')
                    {
                        ns1blankspace.status.error('Error initating accounts. [' + data.error.errornotes + ']')
                    }
                    else
                    {
					    ns1blankspace.util.financial.accounts.init(oParam);
                    }
				}
			});
		},
	}
}