/*!
 * ibCom Pty Ltd ATF ibCom Unit Trust & contributors
 * Licensed as Attribution-ShareAlike 4.0 International
 * http://creativecommons.org/licenses/by-sa/4.0/
 */
 
ns1blankspace.financial.expense = 
{
	init: 		function (oParam)
				{
					var bInitialised = false;

					if (oParam != undefined)
					{
						if (oParam.initialised != undefined) {bInitialised = oParam.initialised}	
					}
				
					ns1blankspace.app.reset();

					ns1blankspace.object = 2;
					ns1blankspace.objectParentName = 'financial';
					ns1blankspace.objectName = 'expense';
					ns1blankspace.objectContextData = undefined;
					ns1blankspace.objectContext = -1;
					ns1blankspace.viewName = 'Expenses';
					
					if (!bInitialised)
					{
						ns1blankspace.financial.initData(oParam)
					}
					else
					{
						oParam.bind = ns1blankspace.financial.expense.bind;
						oParam.xhtml = '<table id="ns1blankspaceOptions" class="ns1blankspaceViewControlContainer">' +	
											'<tr class="ns1blankspaceOptions">' +
											'<td id="ns1blankspaceControlActionOptionsRemove" class="ns1blankspaceViewControl">' +
											'Delete' +
											'</td></tr>' +
											'<tr class="ns1blankspaceOptions">' +
											'<td id="ns1blankspaceControlActionOptionsCopy" class="ns1blankspaceViewControl">' +
											'Copy' +
											'</td></tr>' +
											'</table>';

						ns1blankspace.app.set(oParam);
					}	
				},

	bind: 	function (oParam)
				{
					$('#ns1blankspaceControlActionOptionsRemove')
					.click(function() 
					{
						ns1blankspace.app.options.remove(oParam)
					});

					$('#ns1blankspaceControlActionOptionsCopy')
					.click(function() 
					{
						ns1blankspace.financial.expense.copy.init(oParam)
					});
				},			

	refresh: function (oParam, oResponse)
				{
					if (oResponse == undefined)
					{
						$('#ns1blankspaceControlSubContext_amount').html(ns1blankspace.xhtml.loadingSmall);
							
						var oSearch = new AdvancedSearch();
						oSearch.method = 'FINANCIAL_EXPENSE_SEARCH';
						oSearch.addField('accrueddate,amount,tax,outstandingamount,creditamount');
						oSearch.rf = 'json';
						oSearch.addFilter('id', 'EQUAL_TO', ns1blankspace.objectContext);
						oSearch.getResults(function(data) {ns1blankspace.financial.expense.refresh(oParam, data)});
					}
					else
					{
						var oObjectContext = oResponse.data.rows[0];
								
						ns1blankspace.objectContextData.accrueddate = ns1blankspace.util.fd(oObjectContext.accrueddate);
						ns1blankspace.objectContextData.amount = oObjectContext.amount;
						ns1blankspace.objectContextData.tax = oObjectContext.tax;
						ns1blankspace.objectContextData.outstandingamount = oObjectContext.outstandingamount;
						ns1blankspace.objectContextData.preadjustmentamount =
							(_.toNumber(oObjectContext.amount.replace(',', '')) +
									_.toNumber(oObjectContext.creditamount.replace(',', ''))).formatMoney(2, ".", ",");
								
						$('#ns1blankspaceControlContext_accrueddate').html(ns1blankspace.objectContextData.accrueddate);
						$('#ns1blankspaceControlContext_amount').html(ns1blankspace.option.currencySymbol + ns1blankspace.objectContextData.preadjustmentamount);
						$('#ns1blankspaceControlContext_outstanding').html('<span style="background-color:#CCCCCC; color: white;">' +
												ns1blankspace.option.currencySymbol + ns1blankspace.objectContextData.outstandingamount + '</span>');

						//ns1blankspace.financial.expense.payment.refresh();
					}
				},

	copy: 	{			
					init: 		function (oParam, oResponse)
								{		
									ns1blankspace.container.hide({force: true});

									if (oResponse == undefined)
									{
										ns1blankspace.status.working('Copying...');

										var oData = ns1blankspace.objectContextData;
										delete oData.id;
										delete oData.reference;
										delete oData.paymentduedate;
										oData.description = '[Copy] ' + oData.description;
										oData.accrueddate = Date.today().toString("dd MMM yyyy");

										$.ajax(
										{
											type: 'POST',
											url: ns1blankspace.util.endpointURI('FINANCIAL_EXPENSE_MANAGE'),
											data: oData,
											dataType: 'json',
											success: function(data){ns1blankspace.financial.expense.copy.init(oParam, data)}
										});

									}
									else
									{
										if (oResponse.status == 'OK')
										{
											oParam = ns1blankspace.util.setParam(oParam, 'id', oResponse.id);
											ns1blankspace.financial.expense.copy.process(oParam);
										}
										else
										{
											ns1blankspace.status.error('Cannot copy expense')
										}
									}	
								},

					process: 	function (oParam, oResponse)
								{
									if (oResponse == undefined)
									{
										var oSearch = new AdvancedSearch();
										oSearch.method = 'FINANCIAL_ITEM_SEARCH';
										oSearch.addField('financialaccount,taxtype,tax,amount,description');
										oSearch.addFilter('object', 'EQUAL_TO', ns1blankspace.object);
										oSearch.addFilter('objectcontext', 'EQUAL_TO', ns1blankspace.objectContext);
										oSearch.sort('financialaccounttext', 'asc');
					
										oSearch.getResults(function(data) {ns1blankspace.financial.expense.copy.process(oParam, data)});
									}	
									else
									{
										if (oParam.index == undefined) {oParam.index = 0} else {oParam.index = oParam.index + 1}

										if (oParam.index < oResponse.data.rows.length)
										{
											var oData = oResponse.data.rows[oParam.index];
											delete oData.id;
											oData.object = ns1blankspace.object;
											oData.objectContext = oParam.id;

											$.ajax(
											{
												type: 'POST',
												url: ns1blankspace.util.endpointURI('FINANCIAL_ITEM_MANAGE'),
												data: oData,
												dataType: 'json',
												success: function(oItemResponse)
												{
													ns1blankspace.financial.expense.copy.process(oParam, oResponse)
												}
											});	
										}
										else
										{
											ns1blankspace.status.message("Copied");
											ns1blankspace.objectContext = oParam.id;
											ns1blankspace.inputDetected = false;
											ns1blankspace.financial.expense.search.send('-' + ns1blankspace.objectContext, {source: 1});
										}
									}
								}		
				},			

	home: 	function (oParam, oResponse)
				{
					if (oResponse == undefined)
					{
						var aHTML = [];
						var h = -1;
									
						aHTML.push('<table class="ns1blankspaceMain">' + 
										'<tr class="ns1blankspaceMain">' +
										'<td id="ns1blankspaceMostLikely" class="ns1blankspaceMain">' +
										ns1blankspace.xhtml.loading +
										'</td></tr>' + 
										'</table>');					
						
						$('#ns1blankspaceMain').html(aHTML.join(''));
						
						var aHTML = [];

						aHTML.push('<table>');
						aHTML.push('<tr><td><div id="ns1blankspaceViewFinancialLarge" class="ns1blankspaceViewImageLarge"></div></td></tr>');

						aHTML.push('<tr class="ns1blankspaceControl">' +
									'<td style="padding-top:15px;" id="ns1blankspaceControlOutstanding" class="ns1blankspaceControl"><div>To Be Paid</div>' +
									'<div class="ns1blankspaceSub" style="font-size:0.75em;">Create a file for payment</div></td>' +
									'</tr>');

						if (ns1blankspace.option.expenseShowImages)
						{
							aHTML.push('<tr class="ns1blankspaceControl">' +
									'<td style="padding-top:15px;" id="ns1blankspaceControlExpenseImages" class="ns1blankspaceControl">' +
											'Payment<br />Receipts<br /><span class="ns1blankspaceSub" style="font-size:0.75em;">photos</span></td>' +
									'</tr>');
						}

						aHTML.push('</table>');		
						
						$('#ns1blankspaceControl').html(aHTML.join(''));

						$('#ns1blankspaceControlOutstanding').click(function(event)
						{
							ns1blankspace.financial.expense.outstanding.init();
						});

						$('#ns1blankspaceControlExpenseImages').click(function(event)
						{
							ns1blankspace.financial.payment.images.show();
						});		
						
						$(ns1blankspace.xhtml.container).hide(ns1blankspace.option.hideSpeedOptions);
						
						var oSearch = new AdvancedSearch();
						oSearch.method = 'FINANCIAL_EXPENSE_SEARCH';
						oSearch.addField('reference,description,amount,accrueddate,contactbusinesspaidtotext,contactpersonpaidtotext,object,objectcontext,payeereference');
						oSearch.rows = ns1blankspace.option.defaultRows;
						oSearch.sort('modifieddate', 'desc');
						oSearch.getResults(function (data) {ns1blankspace.financial.expense.home(oParam, data)});
					}
					else
					{
						var aHTML = [];
						
						if (oResponse.data.rows.length == 0)
						{
							aHTML.push('<table id="ns1blankspaceMostLikely">');
							aHTML.push('<tr><td class="ns1blankspaceNothing">Click New to create an expense.</td></tr>');
							aHTML.push('</table>');
						}
						else
						{
							aHTML.push('<div class="ns1blankspaceCaption" style="padding-left:8px;">RECENT</div>');
							aHTML.push('<table id="ns1blankspaceMostLikely" class="table">');
						
							$.each(oResponse.data.rows, function()
							{				
								aHTML.push('<tr class="ns1blankspaceRow">');
								
								aHTML.push('<td id="ns1blankspaceMostLikely_title-' + this.id + '" class="ns1blankspaceMostLikely" style="width:50px;">' +
														this.reference + '</td>');	

								aHTML.push('<td id="ns1blankspaceMostLikely_amount-' + this.id + '" class="ns1blankspaceMostLikelySub" style="width:65px;text-align:right;padding-left:10px;padding-right:10px;">' +
														'$' + this.amount + '</td>');

								aHTML.push('<td id="ns1blankspaceMostLikely_date-' + this.id + '" class="ns1blankspaceMostLikelySub" style="width:100px;text-align:right;padding-right:15px;">' +
														ns1blankspace.util.fd(this.accrueddate) + '</td>');

								var sContact = this.contactbusinesspaidtotext
								if (sContact == '') {sContact = this.contactpersonpaidtotext}
			
								aHTML.push('<td id="ns1blankspaceMostLikely_contact-' + this.id + '" class="ns1blankspaceMostLikelySub" style="width:200px;padding-right:15px;">' +
														sContact + '</td>');

								aHTML.push('<td id="ns1blankspaceMostLikely_contact-' + this.id + '" class="ns1blankspaceMostLikelySub">' +
														this.payeereference + '</td>');
									
								aHTML.push('</tr>');
							});
							
							aHTML.push('</tbody></table>');
						}
						
						$('#ns1blankspaceMostLikely').html(aHTML.join(''));
					
						$('td.ns1blankspaceMostLikely').click(function(event)
						{
							ns1blankspace.financial.expense.search.send(event.target.id, {source: 1});
						});
					}
				},

	search: 	{
					send:		function (sXHTMLElementId, oParam)
								{
									var aSearch = sXHTMLElementId.split('-');
									var sElementId = aSearch[0];
									var sSearchContext = aSearch[1];
									var iMinimumLength = 0;
									var iSource = ns1blankspace.data.searchSource.text;
									var sSearchText;
									var iMaximumColumns = 1;
									var iRows = 10;
									
									if (oParam != undefined)
									{
										if (oParam.source != undefined) {iSource = oParam.source}
										if (oParam.searchText != undefined) {sSearchText = oParam.searchText}
										if (oParam.rows != undefined) {iRows = oParam.rows}
										if (oParam.searchContext != undefined) {sSearchContext = oParam.searchContext}
										if (oParam.minimumLength != undefined) {iMinimumLength = oParam.minimumLength}
										if (oParam.maximumColumns != undefined) {iMaximumColumns = oParam.maximumColumns}
									}
									
									if (sSearchContext != undefined  && iSource != ns1blankspace.data.searchSource.browse)
									{
										$('#ns1blankspaceViewportControl').html(ns1blankspace.xhtml.loading);
										
										ns1blankspace.objectContext = sSearchContext;
										
										var oSearch = new AdvancedSearch();
										oSearch.method = 'FINANCIAL_EXPENSE_SEARCH';
										oSearch.addField('contactbusinesspaidtotext,contactbusinesspaidto,contactpersonpaidtotext,contactpersonpaidto,projecttext,project,projecttext,areatext,' +
																'area,reference,accrueddate,description,amount,outstandingamount,tax,object,objectcontext,paymentduedate,payeereference,creditamount,bankaccount,' +
																'paystatus,paystatustext');

										oSearch.addField(ns1blankspace.option.auditFields);
										
										oSearch.rf = 'json';
										oSearch.addFilter('id', 'EQUAL_TO', sSearchContext);
										
										oSearch.getResults(function(data) {ns1blankspace.financial.expense.show(oParam, data)});
									}
									else
									{
										if (sSearchText == undefined)
										{
											sSearchText = $('#ns1blankspaceViewControlSearch').val();
										}	
										
										if (iSource == ns1blankspace.data.searchSource.browse)
										{
											iMinimumLength = 1;
											iMaximumColumns = 4;
											var aSearch = sSearch.split('-');
											sSearchText = aSearch[1];
										}
										
										if (sSearchText.length >= iMinimumLength || iSource == ns1blankspace.data.searchSource.browse)
										{
											ns1blankspace.search.start();
											
											var oSearch = new AdvancedSearch();
											oSearch.method = 'FINANCIAL_EXPENSE_SEARCH';
											oSearch.addField('reference,accrueddate,amount,contactbusinesspaidtotext,contactpersonpaidtotext,payeereference,description');
											
											if (sSearchText != '')
											{	
												oSearch.addBracket('(');
												oSearch.addFilter('reference', 'TEXT_IS_LIKE', sSearchText);
												oSearch.addOperator('or');
												oSearch.addFilter('expense.contactbusinesspaidto.tradename', 'TEXT_IS_LIKE', sSearchText);
												oSearch.addOperator('or');
												oSearch.addFilter('expense.contactpersonpaidto.surname', 'TEXT_IS_LIKE', sSearchText);
												oSearch.addOperator('or');
												oSearch.addFilter('expense.contactpersonpaidto.firstname', 'TEXT_IS_LIKE', sSearchText);
												oSearch.addOperator('or');
												oSearch.addFilter('expense.payeereference', 'TEXT_IS_LIKE', sSearchText);

												if (sSearchText != '')
												{	
													if (!_.isNaN(_.toNumber(sSearchText)))
													{
														oSearch.addOperator('or');
														oSearch.addFilter('expense.amount', 'APPROX_EQUAL_TO', sSearchText);
													}

													var oSearchDate = moment(sSearchText, 'DD MMM YYYY')
		  											if (oSearchDate.isValid())
													{
														oSearch.addOperator('or');
														oSearch.addFilter('accrueddate', 'EQUAL_TO', oSearchDate.format('DD MMM YYYY'));
													}
												}	

												oSearch.addBracket(')');
											}	

											ns1blankspace.search.advanced.addFilters(oSearch);

											oSearch.sort('accrueddate', 'DESC');
											oSearch.rows = ns1blankspace.option.defaultRowsSmall;
											
											oSearch.getResults(function(data) {ns1blankspace.financial.expense.search.process(oParam, data)});	
										}
									};	
								},

					process:	function (oParam, oResponse)
								{
									var iColumn = 0;
									var iMaximumColumns = 1;
									var aHTML = [];
									var sContact;

									ns1blankspace.search.stop();
										
									if (oResponse.data.rows.length == 0)
									{
										$(ns1blankspace.xhtml.searchContainer).html('<table class="ns1blankspaceSearchMedium"><tr><td class="ns1blankspaceSubNote">Nothing to show</td></tr></table>');
									}
									else
									{		
										aHTML.push('<table class="ns1blankspaceSearchMedium" style="width:520px;">');
											
										$.each(oResponse.data.rows, function()
										{	
											aHTML.push(ns1blankspace.financial.expense.search.row(this, oParam));
										});
								    	
										aHTML.push('</table>');

										$(ns1blankspace.xhtml.searchContainer).html(
											ns1blankspace.render.init(
											{
												html: aHTML.join(''),
												more: (oResponse.morerows == "true"),
												header: false,
												width: 520
											}) 
										);
										
										$('td.ns1blankspaceSearch').click(function(event)
										{
											$(ns1blankspace.xhtml.dropDownContainer).html('&nbsp;');
											$(ns1blankspace.xhtml.dropDownContainer).hide(ns1blankspace.option.hideSpeedOptions)
											ns1blankspace.financial.expense.search.send(event.target.id, {source: 1});
										});

										ns1blankspace.render.bind(
										{
											columns: 'reference-accrueddate-amount',
											more: oResponse.moreid,
											width: 520,
											startRow: parseInt(oResponse.startrow) + parseInt(oResponse.rows),
											functionSearch: ns1blankspace.financial.expense.search.send,
											functionRow: ns1blankspace.financial.expense.search.row
										});  
									}		
								},

						row: 	function (oRow, oParam)
								{
									var aHTML = [];
									var sContact;
												
									aHTML.push('<tr class="ns1blankspaceSearch">');
								
									aHTML.push('<td class="ns1blankspaceSearch" id="' +
													'search-' + oRow.id + '">' +
													oRow.reference +
													'</td>');

									aHTML.push('<td class="ns1blankspaceSearch" id="' +
													'searchContact-' + oRow.id + '">' +
													ns1blankspace.util.fd(oRow.accrueddate) +
													'</td>');

									aHTML.push('<td class="ns1blankspaceSearch" style="text-align:right;" id="' +
													'searchContact-' + oRow.id + '">' +
													oRow.amount +
													'</td>');

									if (oRow.contactbusinesspaidtotext != '')
									{
										sContact = oRow.contactbusinesspaidtotext;
									}
									else
									{
										sContact = oRow.contactpersonpaidtotext;
									}	
									
									aHTML.push('<td class="ns1blankspaceSearch ns1blankspaceSearchSub" id="' +
													'searchContact-' + oRow.id + '">' +
													sContact +
													'</td>');

									aHTML.push('<td class="ns1blankspaceSearch ns1blankspaceSearchSub" id="' +
															'searchContact-' + oRow.id + '">' +
															oRow.payeereference +
															'</td>');

									aHTML.push('<td class="ns1blankspaceSearch ns1blankspaceSearchSub" id="' +
													'searchContact-' + oRow.id + '">' +
													oRow.description +
													'</td>');

									aHTML.push('</tr>');
									
									return aHTML.join('')
								}		
				},				

	layout: 	function ()
				{
					var aHTML = [];
				
					aHTML.push('<div id="ns1blankspaceControlContext" class="ns1blankspaceControlContext"></div>');
					
					aHTML.push('<table class="ns1blankspaceControl">');
					
					if (ns1blankspace.objectContext == -1)
					{
						aHTML.push('<tr><td id="ns1blankspaceControlDetails" class="ns1blankspaceControl ns1blankspaceHighlight">' +
										'Details</td></tr>');
					}
					else
					{	
						aHTML.push('<tr><td id="ns1blankspaceControlSummary" class="ns1blankspaceControl ns1blankspaceHighlight">' +
										'Summary</td></tr>');
									
						aHTML.push('<tr><td id="ns1blankspaceControlDetails" class="ns1blankspaceControl">' +
										'Details</td></tr>');
						
						aHTML.push('<tr><td id="ns1blankspaceControlItem" class="ns1blankspaceControl">' +
										'Items</td></tr>');
					
						aHTML.push('</table>');					
					
						aHTML.push('<table class="ns1blankspaceControl">');
						
						aHTML.push('<tr><td id="ns1blankspaceControlPayments" class="ns1blankspaceControl">' +
										'Payments</td></tr>');

						aHTML.push('<tr><td id="ns1blankspaceControlCredit" class="ns1blankspaceControl">' +
										'Credits</td></tr>');
													
						aHTML.push('<tr><td id="ns1blankspaceControlGL" class="ns1blankspaceControl">' +
										'GL</td></tr>');
									
						aHTML.push('</table>');					
					
						aHTML.push('<table class="ns1blankspaceControl">');
					
						aHTML.push('<tr><td id="ns1blankspaceControlActions" class="ns1blankspaceControl">' +
										'Actions</td></tr>');
									
						aHTML.push('<tr><td id="ns1blankspaceControlAttachments" class="ns1blankspaceControl">' +
										'Attachments</td></tr>');
					}
									
					aHTML.push('</table>');					
							
					$('#ns1blankspaceControl').html(aHTML.join(''));
					
					var aHTML = [];

					aHTML.push('<div id="ns1blankspaceMainSummary" class="ns1blankspaceControlMain"></div>');
					aHTML.push('<div id="ns1blankspaceMainDetails" class="ns1blankspaceControlMain"></div>');
					aHTML.push('<div id="ns1blankspaceMainItem" class="ns1blankspaceControlMain"></div>');
					aHTML.push('<div id="ns1blankspaceMainCredit" class="ns1blankspaceControlMain"></div>');
					aHTML.push('<div id="ns1blankspaceMainPayment" class="ns1blankspaceControlMain"></div>');
					aHTML.push('<div id="ns1blankspaceMainTransaction" class="ns1blankspaceControlMain"></div>');
					aHTML.push('<div id="ns1blankspaceMainActions" class="ns1blankspaceControlMain"></div>');
					aHTML.push('<div id="ns1blankspaceMainAttachments" class="ns1blankspaceControlMain"></div>');
					
					$('#ns1blankspaceMain').html(aHTML.join(''));
					
					$('#ns1blankspaceControlSummary').click(function(event)
					{
						ns1blankspace.show({selector: '#ns1blankspaceMainSummary'});
						ns1blankspace.financial.expense.summary();
					});

					$('#ns1blankspaceControlDetails').click(function(event)
					{
						ns1blankspace.show({selector: '#ns1blankspaceMainDetails'});
						ns1blankspace.financial.expense.details();
					});
					
					$('#ns1blankspaceControlItem').click(function(event)
					{
						ns1blankspace.show({selector: '#ns1blankspaceMainItem', refresh: true});
						ns1blankspace.financial.item.show({namespace: 'expense'});
					});
					
					$('#ns1blankspaceControlCredit').click(function(event)
					{
						ns1blankspace.show({selector: '#ns1blankspaceMainCredit', refresh: true});
						ns1blankspace.financial.util.credit.show({namespace: 'expense'});
					});
					
					$('#ns1blankspaceControlPayments').click(function(event)
					{
						ns1blankspace.show({selector: '#ns1blankspaceMainPayment', refresh: true});
						ns1blankspace.financial.expense.payment.show();
					});
					
					$('#ns1blankspaceControlGL').click(function(event)
					{
						ns1blankspace.show({selector: '#ns1blankspaceMainTransaction', refresh: true});
						ns1blankspace.financial.transactions.show();
					});

					$('#ns1blankspaceControlActions').click(function(event)
					{
						ns1blankspace.show({selector: '#ns1blankspaceMainActions', refresh: true});
						ns1blankspace.actions.show({xhtmlElementID: 'ns1blankspaceMainActions'});
					});

					$('#ns1blankspaceControlAttachments').click(function(event)
					{
						ns1blankspace.show({selector: '#ns1blankspaceMainAttachments', refresh: true});
						ns1blankspace.attachments.show({xhtmlElementID: 'ns1blankspaceMainAttachments'});
					});			
				},

	show:		function (oParam, oResponse)
				{
					ns1blankspace.app.clean();
					ns1blankspace.financial.expense.layout();
					
					var aHTML = [];
					var h = -1;
					
					if (oResponse.data.rows.length == 0)
					{
						ns1blankspace.objectContextData = undefined;
						
						aHTML.push('<table><tr><td class="ns1blankspaceNothing">Sorry can\'t find the expense.</td></tr></table>');
								
						$('#ns1blankspaceMain').html(aHTML.join(''));
					}
					else
					{
						//ns1blankspace.financial.expense.payment.refresh();

						ns1blankspace.objectContextData = oResponse.data.rows[0];
						ns1blankspace.objectContextData.accrueddate = ns1blankspace.util.fd(ns1blankspace.objectContextData.accrueddate);
						ns1blankspace.objectContextData.paymentduedate = ns1blankspace.util.fd(ns1blankspace.objectContextData.paymentduedate);
						ns1blankspace.objectContextData.preadjustmentamount =
							(_.toNumber(ns1blankspace.objectContextData.amount.replace(',', '')) +
									_.toNumber(ns1blankspace.objectContextData.creditamount.replace(',', ''))).formatMoney(2, ".", ",");
						
						$('#ns1blankspaceViewControlAction').button({disabled: false});
						$('#ns1blankspaceViewControlActionOptions').button({disabled: false});

						$('#ns1blankspaceControlContext').html(ns1blankspace.objectContextData.reference +
							'<br /><span id="ns1blankspaceControlContext_accrueddate" class="ns1blankspaceSub">' + ns1blankspace.objectContextData.accrueddate + '</span>' +
							'<br /><span id="ns1blankspaceControlContext_amount" class="ns1blankspaceSub">$' + ns1blankspace.objectContextData.preadjustmentamount + '</span>' +
							'<br /><span id="ns1blankspaceControlContext_outstanding" class="ns1blankspaceSub">' +
												'<span style="background-color:#CCCCCC; color: white;">' +
												ns1blankspace.option.currencySymbol + ns1blankspace.objectContextData.outstandingamount + '</span></span>');
							
						ns1blankspace.history.view(
						{
							newDestination: 'ns1blankspace.financial.expense.init({id: ' + ns1blankspace.objectContext + '})',
							move: false
						});
						
						ns1blankspace.history.control({functionDefault: 'ns1blankspace.financial.expense.summary()'});
					}	
				},		

	summary: 	function ()
				{
					var aHTML = [];
					
					if (ns1blankspace.objectContextData == undefined)
					{
						aHTML.push('<table><tr><td class="ns1blankspaceNothing">Sorry can\'t find the expense.</td></tr></table>');
						$('#ns1blankspaceMainSummary').html(aHTML.join(''));
					}
					else
					{
						aHTML.push('<table class="ns1blankspaceMain">' +
										'<tr class="ns1blankspaceRow">' +
										'<td id="ns1blankspaceSummaryColumn1" class="ns1blankspaceColumn1Flexible"></td>' +
										'<td id="ns1blankspaceSummaryColumn2" class="ns1blankspaceColumn2" style="width:290px;"></td>' +
										'</tr>' +
										'</table>');				
						
						$('#ns1blankspaceMainSummary').html(aHTML.join(''));
						
						var aHTML = [];

						aHTML.push('<table class="ns1blankspace">');
												
						if (ns1blankspace.objectContextData.contactbusinesspaidtotext != '')
						{
							aHTML.push('<tr><td class="ns1blankspaceSummaryCaption">Business</td></tr>' +
											'<tr><td id="ns1blankspaceSummaryBusiness" data-id="' + ns1blankspace.objectContextData.contactbusinesspaidto + '" data-object="contactBusiness" class="ns1blankspaceSummary ns1blankspaceViewLink">' +
											ns1blankspace.objectContextData.contactbusinesspaidtotext +
											'</td></tr>');
						}
						
						if (ns1blankspace.objectContextData.contactpersonpaidtotext != '')
						{
							aHTML.push('<tr><td class="ns1blankspaceSummaryCaption">Person</td></tr>' +
											'<tr><td id="ns1blankspaceSummaryPerson" class="ns1blankspaceSummary">' +
											ns1blankspace.objectContextData.contactpersonpaidtotext +
											'</td></tr>');
						}
						
						if (ns1blankspace.objectContextData.description != '')
						{
							aHTML.push('<tr><td class="ns1blankspaceSummaryCaption">Description</td></tr>' +
											'<tr><td id="ns1blankspaceSummaryDescription" class="ns1blankspaceSummary">' +
											ns1blankspace.objectContextData.description +
											'</td></tr>');
						}

						if (ns1blankspace.objectContextData.payeereference != '')
						{
							aHTML.push('<tr><td class="ns1blankspaceSummaryCaption">Supplier Reference</td></tr>' +
											'<tr><td id="ns1blankspaceSummaryDescription" class="ns1blankspaceSummary">' +
											ns1blankspace.objectContextData.payeereference +
											'</td></tr>');
						}
						
						aHTML.push('</table>');		

						$('#ns1blankspaceSummaryColumn1').html(aHTML.join(''));

						var aHTML = [];

						aHTML.push('<table class="ns1blankspaceColumn2">');

						if (ns1blankspace.objectContextData.paid == 'Y')
						{
							aHTML.push('<tr><td class="ns1blankspaceSummaryCaption">Paid Date</td></tr>' +
											'<tr><td id="ns1blankspaceSummaryPaidDate" class="ns1blankspaceSummary">' +
											ns1blankspace.objectContextData.paiddate +
											'</td></tr>');
						}
						else
						{	
							aHTML.push('<tr><td class="ns1blankspaceSummaryCaption">' +
											'Expense hasn\'t been paid.</td></tr>');			
						}

						aHTML.push('</table>');		

						//$('#ns1blankspaceSummaryColumn2').html(aHTML.join(''));
					}	
				},

	details: 	function ()
				{
					var aHTML = [];
						
					if ($('#ns1blankspaceMainDetails').attr('data-loading') == '1')
					{
						$('#ns1blankspaceMainDetails').attr('data-loading', '');
								
						aHTML.push('<table class="ns1blankspaceContainer">');
						aHTML.push('<tr class="ns1blankspaceContainer">' +
										'<td id="ns1blankspaceDetailsColumn1" class="ns1blankspaceColumn1"></td>' +
										'<td id="ns1blankspaceDetailsColumn2" class="ns1blankspaceColumn2"></td>' +
										'</tr>');
						aHTML.push('</table>');					
						
						$('#ns1blankspaceMainDetails').html(aHTML.join(''));

						var aHTML = [];
						
						aHTML.push('<table class="ns1blankspace">');
						
						aHTML.push('<tr class="ns1blankspaceCaption">' +
										'<td class="ns1blankspaceCaption">' +
										'Reference' +
										'</td></tr>' +
										'<tr class="ns1blankspace">' +
										'<td class="ns1blankspaceText">' +
										'<input id="ns1blankspaceDetailsReference" class="ns1blankspaceText">' +
										'</td></tr>');			
						
						aHTML.push('<tr class="ns1blankspaceCaption">' +
										'<td class="ns1blankspaceCaption">' +
										'Business' +
										'</td></tr>' +
										'<tr class="ns1blankspace">' +
										'<td class="ns1blankspaceText">' +
										'<input id="ns1blankspaceDetailsContactBusinessPaidTo" class="ns1blankspaceSelect"' +
											' data-method="CONTACT_BUSINESS_SEARCH"' +
											' data-columns="tradename">' +
										'</td></tr>');	
							
						aHTML.push('<tr class="ns1blankspaceCaption">' +
										'<td class="ns1blankspaceCaption">' +
										'Person' +
										'</td></tr>' +
										'<tr class="ns1blankspace">' +
										'<td class="ns1blankspaceText">' +
										'<input id="ns1blankspaceDetailsContactPersonPaidTo" class="ns1blankspaceSelect"' +
											' data-method="CONTACT_PERSON_SEARCH"' +
											' data-columns="firstname-space-surname"' +
											' data-parent="ns1blankspaceDetailsContactBusinessPaidTo"' +
											' data-parent-search-id="contactbusiness"' +
											' data-parent-search-text="tradename">' +
										'</td></tr>');							
						
						aHTML.push('<tr class="ns1blankspaceCaption">' +
										'<td class="ns1blankspaceCaption">' +
										'Accrued Date' +
										'</td></tr>' +
										'<tr class="ns1blankspace">' +
										'<td class="ns1blankspaceDate">' +
										'<input id="ns1blankspaceDetailsAccruedDate" class="ns1blankspaceDate">' +
										'</td></tr>');		
											
						aHTML.push('<tr class="ns1blankspaceCaption">' +
										'<td class="ns1blankspaceCaption">' +
										'Due Date' +
										'</td></tr>' +
										'<tr class="ns1blankspace">' +
										'<td class="ns1blankspaceDate">' +
										'<input id="ns1blankspaceDetailsDueDate" class="ns1blankspaceDate">' +
										'</td></tr>');


						aHTML.push('<tr class="ns1blankspaceCaption">' +
										'<td class="ns1blankspaceCaption">' +
										'Pay Status' +
										'</td></tr>' +
										'<tr class="ns1blankspace">' +
										'<td class="ns1blankspaceRadio">' +
										'<input type="radio" id="radioPayStatus1" name="radioPayStatus" value="1"/>Can Be Paid When Due' +
										'<br /><input type="radio" id="radioPayStatus2" name="radioPayStatus" value="2"/>Don\'t Pay - In Dispute' +
										'<br /><input type="radio" id="radioPayStatus3" name="radioPayStatus" value="3"/>Don\'t Pay - Awaiting Goods/Services' +
										'</td></tr>');					
						
						aHTML.push('</table>');					
						
						$('#ns1blankspaceDetailsColumn1').html(aHTML.join(''));
						
						ns1blankspace.util.initDatePicker({select: 'input.ns1blankspaceDate'});

						var aHTML = [];
						
						aHTML.push('<table class="ns1blankspace">');
							
						aHTML.push('<tr class="ns1blankspaceCaption">' +
										'<td class="ns1blankspaceCaption">' +
										'Description' +
										'</td></tr>' +
										'<tr class="ns1blankspace">' +
										'<td class="ns1blankspaceTextMulti">' +
										'<textarea id="ns1blankspaceDetailsDescription" class="ns1blankspaceTextMulti" rows="10" cols="35" style="height:150px;"></textarea>' +
										'</td></tr>');

						aHTML.push('<tr class="ns1blankspaceCaption">' +
										'<td class="ns1blankspaceCaption">' +
										'Supplier Reference' +
										'</td></tr>' +
										'<tr class="ns1blankspace">' +
										'<td class="ns1blankspaceText">' +
										'<input id="ns1blankspaceDetailsPayeeReference" class="ns1blankspaceText" style="width:250px;">' +
										'</td></tr>');

						aHTML.push('<tr class="ns1blankspace">' +
										'<td class="ns1blankspaceCaption">' +
										'Pay From Bank Account' +
										'</td></tr>' +
										'<tr class="ns1blankspaceRadio">' +
										'<td id="ns1blankspaceDetailsBankAccount" class="ns1blankspaceRadio">');
										
										$.each(ns1blankspace.financial.data.bankaccounts, function()
										{					
											aHTML.push('<input type="radio" id="radioBankAccount' + this.id + '" name="radioBankAccount" value="' + this.id + '"/>' +
																this.title + '<br />');				
										});
																		
						aHTML.push('</table>');					
							
						$('#ns1blankspaceDetailsColumn2').html(aHTML.join(''));

						var iDefaultBankAccount;

						if (ns1blankspace.objectContextData != undefined)
						{
							$('#ns1blankspaceDetailsReference').val(ns1blankspace.objectContextData.reference.formatXHTML());
							$('#ns1blankspaceDetailsContactBusinessPaidTo').attr('data-id', ns1blankspace.objectContextData.contactbusinesspaidto);
							$('#ns1blankspaceDetailsContactBusinessPaidTo').val(ns1blankspace.objectContextData.contactbusinesspaidtotext.formatXHTML());
							$('#ns1blankspaceDetailsContactPersonPaidTo').attr('data-id', ns1blankspace.objectContextData.contactpersonpaidto);
							$('#ns1blankspaceDetailsContactPersonPaidTo').val(ns1blankspace.objectContextData.contactpersonpaidtotext.formatXHTML());	
							$('#ns1blankspaceDetailsAccruedDate').val(ns1blankspace.objectContextData.accrueddate);
							$('#ns1blankspaceDetailsDueDate').val(ns1blankspace.objectContextData.paymentduedate);
							$('[name="radioPaid"][value="' + ns1blankspace.objectContextData.paid + '"]').attr('checked', true);
							$('#ns1blankspaceDetailsDescription').val(ns1blankspace.objectContextData.description.formatXHTML());
							$('#ns1blankspaceDetailsPayeeReference').val(ns1blankspace.objectContextData.payeereference.formatXHTML());
							$('[name="radioPayStatus"][value="' + ns1blankspace.objectContextData.paystatus + '"]').attr('checked', true);
							iDefaultBankAccount = ns1blankspace.objectContextData.bankaccount;
						}
						else
						{
							var oDefaultBankAccount = _.find(ns1blankspace.financial.data.bankaccounts, function (ba) {return ba.defaultpaymentaccount == 'Y'});

							if (_.isUndefined(oDefaultBankAccount))
							{
								iDefaultBankAccount = _.first(ns1blankspace.financial.data.bankaccounts).id;
							}
							else
							{
								iDefaultBankAccount = oDefaultBankAccount.id
							}	

							$('[name="radioPaid"][value="N"]').attr('checked', true);
							$('[name="radioPayStatus"][value="1"]').attr('checked', true);
							$('#ns1blankspaceDetailsAccruedDate').val(Date.today().toString("dd MMM yyyy"));
						}

						$('[name="radioBankAccount"][value="' + iDefaultBankAccount + '"]').attr('checked', true);
					}	
				},
			
	save: 	{
					send: 		function (oParam, oResponse)
								{
									if (oResponse == undefined)
									{
										ns1blankspace.status.working();
										
										var sData = (ns1blankspace.objectContext == -1)?'':'id=' + ns1blankspace.objectContext;
											
										if ($('#ns1blankspaceMainDetails').html() != '')
										{
											sData += '&reference=' + ns1blankspace.util.fs($('#ns1blankspaceDetailsReference').val());
											sData += '&accrueddate=' + ns1blankspace.util.fs($('#ns1blankspaceDetailsAccruedDate').val());
											sData += '&paymentduedate=' + ns1blankspace.util.fs($('#ns1blankspaceDetailsDueDate').val());
											sData += '&description=' + ns1blankspace.util.fs($('#ns1blankspaceDetailsDescription').val());
											sData += '&contactbusinesspaidto=' + ns1blankspace.util.fs($('#ns1blankspaceDetailsContactBusinessPaidTo').attr("data-id"));
											sData += '&contactpersonpaidto=' + ns1blankspace.util.fs($('#ns1blankspaceDetailsContactPersonPaidTo').attr("data-id"));
											sData += '&payeereference=' + ns1blankspace.util.fs($('#ns1blankspaceDetailsPayeeReference').val());
											sData += '&bankaccount=' + $('[name="radioBankAccount"]:checked').val();
											sData += '&paystatus=' + $('[name="radioPayStatus"]:checked').val();
										}
										
										$.ajax(
										{
											type: 'POST',
											url: ns1blankspace.util.endpointURI('FINANCIAL_EXPENSE_MANAGE'),
											data: sData,
											dataType: 'json',
											success: function(data) {ns1blankspace.financial.expense.save.send(oParam, data)}
										});
										
									}
									else
									{			
										if (oResponse.status == 'OK')
										{	
											ns1blankspace.status.message('Saved');
											ns1blankspace.inputDetected = false;
											
											if (ns1blankspace.objectContext == -1)
											{
												ns1blankspace.objectContext = oResponse.id;
												ns1blankspace.financial.expense.search.send('-' + ns1blankspace.objectContext, {source: 1});
											}	
										}
										else
										{
											ns1blankspace.status.error(_.upperFirst(oResponse.error.errornotes));
										}
									}	
								}
				},				

	payment: {
					refresh:	function (oParam, oResponse)
								{
									if (oResponse == undefined)
									{
										$('#ns1blankspaceControlContext_outstanding').html(ns1blankspace.xhtml.loadingSmall);
											
										var oSearch = new AdvancedSearch();
										oSearch.method = 'FINANCIAL_PAYMENT_EXPENSE_SEARCH';
										oSearch.addField('amount');
										oSearch.addSummaryField('sum(amount) sumamount');
										oSearch.addFilter('expense', 'EQUAL_TO', ns1blankspace.objectContext);
										oSearch.rows = 1;
										oSearch.getResults(function(data){ns1blankspace.financial.expense.payment.refresh(oParam, data)});
									}
									else
									{
										ns1blankspace.objectContextData.outstanding = oResponse.summary.sumamount;
										$('#ns1blankspaceControlContext_outstanding').html('<span style="background-color:#CCCCCC; color: white;">' +
												'$' + ((ns1blankspace.objectContextData.amount).parseCurrency() -
												(oResponse.summary.sumamount).parseCurrency()).formatMoney(2, ".", ",") + '</span>');
									}
								},

					show:		function (oParam, oResponse)
								{
									var iObjectContext = ns1blankspace.util.getParam(oParam, 'objectContext', {"default": ns1blankspace.objectContext}).value;
									var oOptions = ns1blankspace.util.getParam(oParam, 'options', {"default": {view: true, remove: true}}).value;
									var oActions = ns1blankspace.util.getParam(oParam, 'actions', {"default": {add: true}}).value;
										
									if (oParam == undefined) {oParam = {}}
										
									if (oResponse == undefined)
									{	
										var aHTML = [];

										aHTML.push('<table class="ns1blankspaceContainer">');

										aHTML.push('<tr class="ns1blankspaceContainer">' +
														'<td id="ns1blankspacePaymentColumn1" class="ns1blankspaceColumn1Flexible">' +
														ns1blankspace.xhtml.loading + '</td>' +
														'<td id="ns1blankspacePaymentColumn2" style="width: 400px;">' +
															'<table class="ns1blankspaceColumn2">' +
															'<tr><td id="ns1blankspacePaymentColumn2Summary" colspan="2"></td></tr>' +
															'<tr><td class="ns1blankspaceHeaderCaption" style="padding-top:12px; padding-left:4px;">Create new...</td>' +
															'<td class="ns1blankspaceColumn2 ns1blankspaceHeaderCaption" id="ns1blankspacePaymentColumn2Select" style="padding-left:14px; padding-top:12px; width:160px;">or select existing...</td></tr>' +
															'<tr><td class="ns1blankspaceColumn2" id="ns1blankspacePaymentColumn2Add"></td>' +
															'<td class="ns1blankspaceColumn2" id="ns1blankspacePaymentColumn2Allocate" style="font-size:0.875em;"></td></tr>' +
															'</table>' +
														'</td>' +
														'</tr>');
										
										aHTML.push('</table>');					
										
										$('#ns1blankspaceMainPayment').html(aHTML.join(''));	
										
										if (false && oActions.add)
										{
											var aHTML = [];
										
											aHTML.push('<table class="ns1blankspaceColumn2">');
										
											aHTML.push('<tr><td>' +
														'<span id="ns1blankspacePaymentAdd" class="ns1blankspaceAction">Add</span>' +
														'</td></tr>');

											aHTML.push('</table>');
										
											$('#ns1blankspacePaymentColumn2').html(aHTML.join(''));
										
											$('#ns1blankspacePaymentAdd').button(
											{
												label: "Add"
											})
											.click(function() {
												 ns1blankspace.financial.expense.payment.edit(oParam);
											});
										}

										ns1blankspace.financial.expense.payment.edit(oParam);
										
										var oSearch = new AdvancedSearch();
										oSearch.method = 'FINANCIAL_PAYMENT_EXPENSE_SEARCH';
										oSearch.addField('appliesdate,amount,paymentlineitem,paymentexpense.payment.reference,paymentexpense.payment.amount,paymentexpense.payment.id');
										oSearch.addFilter('expense', 'EQUAL_TO', iObjectContext);
										oSearch.sort('appliesdate', 'asc');
										oSearch.rows = 999;
										oSearch.getResults(function(data) {ns1blankspace.financial.expense.payment.show(oParam, data)});
									}
									else
									{
										var aHTML = [];
										
										if (oResponse.data.rows.length == 0)
										{
											aHTML.push('<table class="ns1blankspace">' +
															'<tr><td class="ns1blankspaceNothing">No payments.</td></tr>' + 
															'</table>');

											$('#ns1blankspacePaymentColumn1').html(aHTML.join(''));
										}
										else
										{
											var oPayments = oResponse.data.rows;

											aHTML.push('<table class="ns1blankspace" id="ns1blankspaceFinancialExpensePayments">');
											aHTML.push('<tr class="ns1blankspaceCaption">');
											aHTML.push('<td class="ns1blankspaceHeaderCaption">Reference</td>');
											aHTML.push('<td class="ns1blankspaceHeaderCaption">Date</td>');
											aHTML.push('<td class="ns1blankspaceHeaderCaption" style="text-align:right;">Amount</td>');
											aHTML.push('<td class="ns1blankspaceHeaderCaption">&nbsp;</td>');
											aHTML.push('</tr>');

											$.each(oPayments, function(p, payment)
											{
												aHTML.push('<tr class="ns1blankspaceRow">');
																			
												aHTML.push('<td id="ns1blankspacePayment_date-' + this.id + '-' + this.paymentlineitem + '" class="ns1blankspaceRow">' +
																this['paymentexpense.payment.reference'] + '</td>');

												aHTML.push('<td id="ns1blankspacePayment_date-' + this.id + '" class="ns1blankspaceRow">' +
																this['appliesdate'] + '</td>');

												aHTML.push('<td id="ns1blankspacePayment_amount-' + this.id + '" class="ns1blankspaceRow" style="text-align:right;">' +
																this['amount'] + '</td>');
						
												aHTML.push('<td style="width:60px;text-align:right;" class="ns1blankspaceRow">');
													
												if (oOptions.remove)
												{
													aHTML.push('<span id="ns1blankspacePayment_options_remove-' + this.id + '-' + this.paymentlineitem + '" class="ns1blankspaceRemove"></span>');
												}
												
												if (oOptions.view)
												{	
													aHTML.push('<span id="ns1blankspacePayment_options_view-' + payment['paymentexpense.payment.id'] + '" class="ns1blankspaceView"></span>');
												}

												aHTML.push('</td></tr>');
											});
											
											aHTML.push('</table>');

											$('#ns1blankspacePaymentColumn1').html(aHTML.join(''));
											
											$('#ns1blankspaceFinancialExpensePayments .ns1blankspaceRemove').button(
											{
												text: false,
												icons:
												{
													primary: "ui-icon-close"
												}
											})
											.click(function()
											{
												ns1blankspace.remove(
												{
													xhtmlElementID: this.id,
													method: 'FINANCIAL_PAYMENT_EXPENSE_MANAGE',
													ifNoneMessage: 'No payments.',
													caption: 'Remove',
													onComplete: ns1blankspace.financial.expense.payment.remove
												});
											})
											.css('width', '15px')
											.css('height', '17px');

											$('#ns1blankspaceFinancialExpensePayments .ns1blankspaceView').button(
											{
												text: false,
												icons:
												{
													primary: "ui-icon-play"
												}
											})
											.click(function()
											{
												ns1blankspace.financial.payment.init({id: (this.id).split('-')[1]})
											})
											.css('width', '15px')
											.css('height', '17px');
										}
									}	
								},

					remove: 	function (oParam)
								{
									var sXHTMLElementID = ns1blankspace.util.getParam(oParam, 'xhtmlElementID').value;
									var sData = 'remove=1&id=' + ns1blankspace.util.getParam(oParam, 'xhtmlElementID', {index: 1}).value;
									var iPaymentItemID = ns1blankspace.util.getParam(oParam, 'xhtmlElementID', {index: 2}).value;
	
									if (iPaymentItemID != undefined)
									{
										var oData = 
										{
											id: iPaymentItemID,
											financialaccount: ns1blankspace.financial.data.settings.financialaccountunallocated.outgoing
										}

										if (ns1blankspace.option.financialOverride)
										{
											oData.override = 'Y'
										}	
													
										$.ajax(
										{
											type: 'POST',
											url: ns1blankspace.util.endpointURI('FINANCIAL_ITEM_MANAGE'),
											data: oData,
											dataType: 'json',
											success: function(data)
											{
												ns1blankspace.financial.expense.payment.show();
												ns1blankspace.financial.expense.refresh();
											}
										});
									}
									else
									{
										ns1blankspace.financial.expense.payment.show();
										ns1blankspace.financial.expense.refresh();
									}	
								},

					allocate:
					 			{
					 				data: {},

					 				init: function (oParam, oResponse)
					 				{
					 					if (oResponse == undefined)
					 					{
					 						var oSearch = new AdvancedSearch();
											oSearch.method = 'FINANCIAL_ITEM_SEARCH';
											oSearch.addField('amount,object,financialaccount,description,' +
																	'lineitem.payment.reference,lineitem.payment.id,lineitem.payment.contactbusinesspaidtotext,' +
																	'lineitem.payment.contactpersonpaidtotext,' +
																	'lineitem.payment.reference,lineitem.payment.paiddate,lineitem.payment.amount');
											oSearch.addFilter('financialaccount', 'EQUAL_TO', ns1blankspace.financial.data.settings.financialaccountunallocated.outgoing);
											//oSearch.addFilter('lineitem.payment.reference', 'TEXT_IS_NOT_EMPTY');
											oSearch.addFilter('amount', 'NOT_EQUAL_TO', 0);

											if (ns1blankspace.objectContextData.contactbusinesspaidto != '')
											{
												oSearch.addFilter('lineitem.payment.contactbusinesspaidto', 'EQUAL_TO', ns1blankspace.objectContextData.contactbusinesspaidto);
											}
												
											if (ns1blankspace.objectContextData.contactpersonpaidto != '')
											{
												oSearch.addFilter('lineitem.payment.contactpersonpaidto', 'EQUAL_TO', ns1blankspace.objectContextData.contactpersonpaidto);
											}

											oSearch.getResults(function(data)
											{
												ns1blankspace.financial.expense.payment.allocate.init(oParam, data)
											});
										}
										else
										{
											ns1blankspace.financial.expense.payment.allocate.data.paymentItems = oResponse.data.rows;

											if (oResponse.data.rows.length == 0)
											{
												$('#ns1blankspacePaymentColumn2Select').html('&nbsp;');
											}
											else
											{
												var oPayments = _.groupBy(oResponse.data.rows, 'lineitem.payment.id');

												var aHTML = [];

												aHTML.push('<table class="ns1blankspaceColumn2" style="margin-left:0px; margin-right:0px;">');
												
												$.each(oPayments, function(i, aPayments)
												{
													aHTML.push('<tr class="ns1blankspaceRow">');
													aHTML.push('<td style="width:30%;" class="ns1blankspaceRow ns1blankspaceRowShaded">')

														aHTML.push('<table class="ns1blankspace">');

														aHTML.push('<tr><td id="ns1blankspaceExpense_reference-' + aPayments[0].id + '">' +
																	aPayments[0]['lineitem.payment.reference'] + '</td></tr>');
																								
														aHTML.push('<tr><td id="ns1blankspaceExpense_date-' + aPayments[0].id + '" class="ns1blankspaceSubNote">' +
																	ns1blankspace.util.fd(aPayments[0]['lineitem.payment.paiddate']) + '</td></tr>');

														aHTML.push('<tr><td id="ns1blankspaceExpense_amount-' + aPayments[0].id + '" class="ns1blankspaceSubNote">$' +
																	aPayments[0]['lineitem.payment.amount'] + '</td></tr>');

														aHTML.push('</table>');

													aHTML.push('</td><td class="ns1blankspaceRow" style="padding-left:8px;">');

														aHTML.push('<table class="ns1blankspace">');
							
														$.each(aPayments, function(j, oPayment)
														{
															aHTML.push('<tr>');

															aHTML.push('<td id="ns1blankspaceExpense_item_amount-' + oPayment['id'] + '" class="ns1blankspace" style="text-align:right;">' +
																	oPayment['amount'] + '</td>');

															aHTML.push('<td style="width:20px;text-align:right;" class="ns1blankspace">' +
																			'<span id="ns1blankspaceExpense_options_apply-' + oPayment['id'] + '" class="ns1blankspacePaymentApply"></span>' +
																			'</td></tr>');
														});
															
														aHTML.push('</table>');

													aHTML.push('</td></tr>');	
												});
												
												aHTML.push('</table>');
											
												$('#ns1blankspacePaymentColumn2Allocate').html(aHTML.join(''));

												$('#ns1blankspacePaymentColumn2Allocate span.ns1blankspacePaymentApply').button(
												{
													text: false,
													icons:
													{
														primary: "ui-icon-check"
													}
												})
												.click(function()
												{
													ns1blankspace.financial.expense.payment.allocate.apply.init({xhtmlElementID: this.id});
												})
												.css('width', '15px')
												.css('height', '17px');
											}	
										}
					 				},

					 				apply:
					 				{
					 					init:	function (oParam, oResponse)
						 				{
						 					var iPaymentItemID = ns1blankspace.util.getParam(oParam, 'xhtmlElementID', {index: 1}).value;

						 					if (oResponse == undefined)
											{
												ns1blankspace.status.working('Allocating...');

												var sOutstanding = 'expense';
												if (ns1blankspace.object == 5) {sOutstanding = 'invoice'}

												var oSearch = new AdvancedSearch();
												oSearch.method = 'FINANCIAL_ITEM_SEARCH';
												oSearch.addField('amount,' + sOutstanding + 'outstandingamount,tax,preadjustmentamount,preadjustmenttax');
												oSearch.addFilter('object', 'EQUAL_TO', ns1blankspace.object);
												oSearch.addFilter('objectcontext', 'EQUAL_TO', ns1blankspace.objectContext);
												oSearch.addFilter(sOutstanding + 'outstandingamount', 'NOT_EQUAL_TO', 0);
												oSearch.sort('id', 'desc');
												
												oSearch.getResults(function(data)
												{
													ns1blankspace.financial.expense.payment.allocate.apply.init(oParam, data)
												});
											}
											else
											{
												ns1blankspace.financial.expense.payment.allocate.data.expenseOutstandingItems = oResponse.data.rows;

												$.each(ns1blankspace.financial.expense.payment.allocate.data.expenseOutstandingItems, function (i, item)
												{
													item.outstandingamount = numeral(item['expenseoutstandingamount']).value();
												});

												ns1blankspace.financial.expense.payment.allocate.data.expenseOutstandingAmount = 
																_.sum(_.map(ns1blankspace.financial.expense.payment.allocate.data.expenseOutstandingItems, function (i) {return numeral(i.expenseoutstandingamount).value()}));

												ns1blankspace.financial.expense.payment.allocate.data.paymentItem = $.grep(ns1blankspace.financial.expense.payment.allocate.data.paymentItems,
																function (payment) {return payment.id == iPaymentItemID});

												if (ns1blankspace.financial.expense.payment.allocate.data.paymentItem.length == 1)
												{
													ns1blankspace.financial.expense.payment.allocate.data.paymentItem =
														ns1blankspace.financial.expense.payment.allocate.data.paymentItem[0];

													ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmount = 
														numeral(ns1blankspace.financial.expense.payment.allocate.data.paymentItem.amount).value();

													ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountUnallocated =
														ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmount;

													ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountToApply =
														ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmount;

													if (ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountToApply >
															ns1blankspace.financial.expense.payment.allocate.data.expenseOutstandingAmount)
													{
														ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountToApply =
															ns1blankspace.financial.expense.payment.allocate.data.expenseOutstandingAmount
													}

													ns1blankspace.util.setParam(oParam, 'index', 0);
													ns1blankspace.financial.expense.payment.allocate.apply.process(oParam);
												}
											}	
						 				},

						 				process:	function (oParam, oResponse)
						 				{
						 					var iPaymentItemID = ns1blankspace.util.getParam(oParam, 'xhtmlElementID', {index: 1}).value;
						 					var iIndexExpenseOutstandingItem = ns1blankspace.util.getParam(oParam, 'index').value;

						 					if (iIndexExpenseOutstandingItem < ns1blankspace.financial.expense.payment.allocate.data.expenseOutstandingItems.length &&
															ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountToApply != 0)
											{
												ns1blankspace.financial.expense.payment.allocate.data.expenseItem =
													ns1blankspace.financial.expense.payment.allocate.data.expenseOutstandingItems[iIndexExpenseOutstandingItem];

												ns1blankspace.financial.expense.payment.allocate.data.expenseItemOutstandingAmount = 
													numeral(ns1blankspace.financial.expense.payment.allocate.data.expenseItem.expenseoutstandingamount).value();

												if (ns1blankspace.financial.expense.payment.allocate.data.expenseItemOutstandingAmount > 0)
												{
													ns1blankspace.financial.expense.payment.allocate.data.applyAmount = 
														ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountToApply;

													if (ns1blankspace.financial.expense.payment.allocate.data.paymenttItemAmountToApply >
															ns1blankspace.financial.expense.payment.allocate.data.paymentItemOutstandingAmount)
													{
														ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountToApply =
															ns1blankspace.financial.expense.payment.allocate.data.expenseItemOutstandingAmount
													}

													ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountToApply =
														ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountToApply -
														ns1blankspace.financial.expense.payment.allocate.data.applyAmount;

													ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountUnallocated =
														ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountUnallocated -
														ns1blankspace.financial.expense.payment.allocate.data.applyAmount;
													
													var oData =
													{
														id: iPaymentItemID
													}

													if (ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountUnallocated == 0)
													{
														//oData.remove = 1;		cb 2.1.7 Was causing errors with Tax. Just make the call with nothing in it
													}
													else
													{
														oData.amount = (ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountUnallocated);
													}

													if (ns1blankspace.option.financialOverride)
													{
														oData.override = 'Y'
													}

													var iPaymentID = ns1blankspace.financial.expense.payment.allocate.data.paymentItem['lineitem.payment.id'];

													$.ajax(
													{
														type: 'POST',
														url: ns1blankspace.util.endpointURI('FINANCIAL_ITEM_MANAGE'),
														data: oData,
														dataType: 'json',
														success: function(data)
														{
															var oData =
															{
																financialaccount: ns1blankspace.financial.data.settings.financialaccountcreditor,
																amount: ns1blankspace.financial.expense.payment.allocate.data.applyAmount,
																object: 3,
																objectcontext: iPaymentID
															}

															if (ns1blankspace.financial.expense.payment.allocate.data.paymentItemAmountUnallocated == 0)
															{
																oData.id = iPaymentItemID; 	//Update the existing lineitem
															}

															if (ns1blankspace.option.financialOverride)
															{
																oData.override = 'Y'
															}

															$.ajax(
															{
																type: 'POST',
																url: ns1blankspace.util.endpointURI('FINANCIAL_ITEM_MANAGE'),
																data: oData,
																dataType: 'json',
																success: function(data)
																{
																	var iPaymentItemCreditorID = data.id;

																	var oData =
																	{
																		expenselineitem: ns1blankspace.financial.expense.payment.allocate.data.expenseItem.id,
																		paymentlineitem: iPaymentItemCreditorID,
																		amount: ns1blankspace.financial.expense.payment.allocate.data.applyAmount
																	}

																	if (ns1blankspace.option.financialOverride)
																	{
																		oData.override = 'Y'
																	}

																	$.ajax(
																	{
																		type: 'POST',
																		url: ns1blankspace.util.endpointURI('FINANCIAL_PAYMENT_EXPENSE_MANAGE'),
																		data: oData,
																		dataType: 'json',
																		success: function(data)
																		{
																			ns1blankspace.util.setParam(oParam, 'index', iIndexExpenseOutstandingItem + 1);
																			ns1blankspace.financial.expense.payment.allocate.apply.process(oParam);
																		}
																	});		
																}
															});		
														}
													});				
												}
											}
											else
											{
												ns1blankspace.status.message('Allocated');
												ns1blankspace.financial.expense.payment.show();
												ns1blankspace.financial.expense.refresh();
											}
						 				}
					 					
					 				}
					 			},					

					edit:		function (oParam, oResponse)
								{
									var iStep = 1;
									var cPaymentAmount = 0;
									var cPaidAmount = 0;

									if (oParam != undefined)
									{
										if (oParam.step != undefined) {iStep = oParam.step}
										if (oParam.paymentAmount != undefined) {cPaymentAmount = oParam.paymentAmount}
										if (oParam.paidAmount != undefined) {cPaidAmount = oParam.paidAmount}	
									}
									
									if (ns1blankspace.financial.data.bankaccounts.length == 0) {alert("No bank accounts set up.");return;}
									
									if (iStep == 1)
									{	
										$('#ns1blankspacePaymentColumn2Summary').html(ns1blankspace.xhtml.loadingSmall)
										
										var oSearch = new AdvancedSearch();
										oSearch.method = 'FINANCIAL_PAYMENT_EXPENSE_SEARCH';
										oSearch.addField('amount');
										oSearch.addSummaryField('sum(amount) sumamount');
										oSearch.addFilter('expense', 'EQUAL_TO', ns1blankspace.objectContext);
										oSearch.rows = 1;
										oSearch.getResults(function(data){ns1blankspace.financial.expense.payment.edit($.extend(true, oParam, {step:2}), data)});
									}
										
									if (iStep == 2)
									{
										cPaidAmount = oResponse.summary.sumamount;
										if (cPaidAmount == '') {cPaidAmount = "0"}
										
										var aHTML = [];
										
										aHTML.push('<table class="_ns1blankspaceColumn2">');
										
										aHTML.push('<tr>' +
														'<td class="ns1blankspaceSub"' +
														' data-paidamount="' + cPaidAmount + '">' +
														'$' + parseFloat(cPaidAmount).formatMoney(2, ".", ",") + ' has been paid so far.' +
														'</td></tr>');
														
										aHTML.push('<tr class="ns1blankspace">' +
														'<td id="ns1blankspacePaymentEditAmount" class="ns1blankspaceSub"' +
														'">' +
														'$' + (parseFloat((ns1blankspace.objectContextData.amount).replace(",","")) - cPaidAmount).formatMoney(2, ".", ",") + ' remaining.' +
														'</td></tr>');

										aHTML.push('</table>')

										$('#ns1blankspacePaymentColumn2Summary').html(aHTML.join(''));

										var aHTML = [];

										aHTML.push('<table class="_ns1blankspaceColumn2">');
				
										aHTML.push('<tr class="ns1blankspace">' +
														'<td class="ns1blankspaceCaption">' +
														'Bank Account' +
														'</td></tr>' +
														'<tr class="ns1blankspaceRadio">' +
														'<td id="ns1blankspacePaymentEditBankAccount" class="ns1blankspaceRadio" style="font-size: 0.75em;">');
									
										var iDefaultBankAccount;

										if (ns1blankspace.objectContextData.bankaccount != '')
										{
											iDefaultBankAccount = ns1blankspace.objectContextData.bankaccount
										}
										
										$.each(ns1blankspace.financial.data.bankaccounts, function()
										{
											if (iDefaultBankAccount == undefined) {iDefaultBankAccount = this.id}
											aHTML.push('<input type="radio" id="radioPaymentBankAccount' + this.id + '" name="radioPaymentBankAccount" value="' + this.id + '"/>' +
																this.title + '<br />');				
										});
										
										aHTML.push('</td></tr>');				
														
										aHTML.push('<tr class="ns1blankspaceCaption">' +
														'<td class="ns1blankspaceCaption">' +
														'Amount' +
														'</td></tr>' +
														'<tr class="ns1blankspace">' +
														'<td class="ns1blankspaceText">' +
														'<input id="ns1blankspacePaymentAmount" class="ns1blankspaceText">' +
														'</td></tr>');

										aHTML.push('<tr class="ns1blankspaceCaption">' +
														'<td class="ns1blankspaceCaption">' +
														'Date' +
														'</td></tr>' +
														'<tr class="ns1blankspace">' +
														'<td class="ns1blankspaceDate">' +
														'<input id="ns1blankspacePaymentDate" class="ns1blankspaceDate">' +
														'</td></tr>');
																		
										aHTML.push('<tr class="ns1blankspace">' +
														'<td id="ns1blankspacePaymentAddContainer">' +
														'<span id="ns1blankspacePaymentAdd" class="ns1blankspaceAction">Pay</span>' +
														'</td></tr>');
										
										aHTML.push('</table>');
												
										$('#ns1blankspacePaymentColumn2Add').html(aHTML.join(''));
												
										$('[name="radioPaymentBankAccount"][value="' + iDefaultBankAccount + '"]').attr('checked', true);
									
										$('#ns1blankspacePaymentAmount').val((ns1blankspace.objectContextData.amount).parseCurrency() - (cPaidAmount).parseCurrency());

										$('#ns1blankspacePaymentAmount').focus();
										$('#ns1blankspacePaymentAmount').select();

										$('#ns1blankspacePaymentDate').val(Date.today().toString("d MMM yyyy"));
										ns1blankspace.util.initDatePicker({select: 'input.ns1blankspaceDate'});

										$('#ns1blankspacePaymentAdd').button(
										{
											label: "Add Payment"
										})
										.click(function() {
											ns1blankspace.financial.expense.payment.edit($.extend(true, oParam,
													{	step: 4,
														paidAmount: cPaidAmount,
														paymentAmount: $('#ns1blankspacePaymentAmount').val(),
														date: $('#ns1blankspacePaymentDate').val()
													}))
										});

										ns1blankspace.financial.expense.payment.allocate.init($.extend(true, oParam,
										{	
											paidAmount: cPaidAmount
										}));
									}
									
									if (iStep == 3)
									{
										//NOT USED
										$('#ns1blankspacePaymentEditFullResults').html(ns1blankspace.xhtml.loadingSmall);
												
										var cAmount = ns1blankspace.objectContextData.amount - cPaidAmount;
										
										var sData = 'bankaccount=' + ns1blankspace.util.fs($('input[name="radioPaymentBankAccount"]:checked').val());
										sData += '&amount=' + ns1blankspace.util.fs(cAmount);
										sData += '&receiveddate=' + ns1blankspace.util.fs(Date.today().toString("dd-MMM-yyyy"));
										sData += '&paymentmethod=3'; //todo
										sData += '&contactbusinessreceivedfrom=' + ns1blankspace.util.fs(ns1blankspace.objectContextData.contactbusinesssentto);	
										sData += '&contactpersonreceivedfrom=' + ns1blankspace.util.fs(ns1blankspace.objectContextData.contactpersonsentto);
												
										$.ajax(
										{
											type: 'POST',
											url: ns1blankspace.util.endpointURI('FINANCIAL_PAYMENT_MANAGE'),
											data: sData,
											dataType: 'json',
											success: function(data)
											{
												ns1blankspace.financial.expense.payment.edit($.extend(true, oParam, {step: 4, amount: cAmount}), data)
											}
										});	
									}
									
									if (iStep == 4)
									{
										var cAmount = cPaymentAmount;
										var dDate = Date.today().toString("dd-MMM-yyyy");
										
										if (oParam != undefined)
										{
											if (oParam.amount != undefined) {cAmount = oParam.amount}
											if (oParam.date != undefined) {dDate = oParam.date}	
										}
										
										var sData = 'id=' + ns1blankspace.util.fs(ns1blankspace.objectContext);
										sData += '&amount=' + ns1blankspace.util.fs(cAmount);
										sData += '&paiddate=' + ns1blankspace.util.fs(dDate);
										sData += '&paymentmethod=3';
										sData += '&bankaccount=' + ns1blankspace.util.fs($('input[name="radioPaymentBankAccount"]:checked').val());

										$.ajax(
										{
											type: 'POST',
											url: ns1blankspace.util.endpointURI('FINANCIAL_AUTO_PAYMENT'),
											data: sData,
											dataType: 'json',
											success: function(data)
											{
												ns1blankspace.financial.expense.payment.edit($.extend(true, oParam, {step: 5}), data)
											}
										});	
									}

									if (iStep == 5)
									{
										ns1blankspace.status.message('Payment added');
										ns1blankspace.financial.expense.payment.show();
										//ns1blankspace.financial.expense.payment.refresh();
										ns1blankspace.financial.expense.refresh();
									}
								}
				}
}								

ns1blankspace.financial.expense.outstanding =
{
	data: 		{searchText: undefined},

	init: 		function (oParam, oResponse)
				{
					if (oResponse === undefined)
					{	
						var oSearch = new AdvancedSearch();
						oSearch.method = 'SETUP_FINANCIAL_FUNDS_TRANSFER_ACCOUNT_SEARCH';
						oSearch.addField('title,provider,providertext,status,statustext,takepayment,makepayment,urlcancel,urlsuccess,provideraccountkey,' +
											'apikey,apilogon');
						oSearch.addFilter('provider', 'EQUAL_TO', 3);
						oSearch.addFilter('makepayment', 'EQUAL_TO', 'Y');
						oSearch.addFilter('status', 'EQUAL_TO', 2);
						oSearch.rows = 100;
						oSearch.getResults(function(data) {ns1blankspace.financial.expense.outstanding.init(oParam, data)});
					}	
					else
					{
						if (oParam === undefined) {oParam = {}}

						if (oResponse.status == 'OK')
						{
							if (oResponse.data.rows.length > 0)
							{
								oParam.paymentAccount = oResponse.data.rows[0].id;
							}							
						}	

						ns1blankspace.financial.expense.outstanding.show(oParam)
					}	
				},

	show:		function (oParam, oResponse)
				{
					var iSearchBankAccount = ns1blankspace.util.getParam(oParam, 'searchBankAccount', {"default": -1}).value;
					var sSearchType = ns1blankspace.util.getParam(oParam, 'searchType', {"default": 'other'}).value;
					var oSearchText = ns1blankspace.util.getParam(oParam, 'searchText');
					var oSearchDate = ns1blankspace.util.getParam(oParam, 'searchDate');
					var sSearchText;
					var sSearchDate;

					if (oSearchText.exists)
					{
						sSearchText = oSearchText.value;
						ns1blankspace.financial.expense.outstanding.data.searchText = sSearchText;
					}
					else
					{	
						sSearchText = ns1blankspace.financial.expense.outstanding.data.searchText;
					}

					if (oSearchDate.exists)
					{
						sSearchDate = oSearchDate.value;
						ns1blankspace.financial.expense.outstanding.data.searchDate = sSearchDate;
					}
					else
					{	
						sSearchDate = ns1blankspace.financial.expense.outstanding.data.searchDate;
					}		

					if (oResponse == undefined)
					{	
						var aHTML = [];
	
						aHTML.push('<table class="ns1blankspaceContainer">' +
										'<tr class="ns1blankspaceContainer">' +
										'<td id="ns1blankspaceExpenseOutstandingColumn1"></td>' +
										'<td id="ns1blankspaceExpenseOutstandingColumn2" style="width:115px;"></td>' +
										'</tr>' +
										'</table>');				
						
						$('#ns1blankspaceMain').html(aHTML.join(''));

						$('#ns1blankspaceExpenseOutstandingColumn1').html(ns1blankspace.xhtml.loading);

						ns1blankspace.financial.expense.outstanding.data.expenses = [];

						var oSearch = new AdvancedSearch();
						oSearch.method = 'FINANCIAL_EXPENSE_SEARCH';
						oSearch.addField('reference,amount,outstandingamount,description,contactbusinesspaidto,contactbusinesspaidtotext,contactpersonpaidto,contactpersonpaidtotext,paymentduedate');
						oSearch.addFilter('PayStatus', 'EQUAL_TO', 1);
						oSearch.addFilter('outstandingamount', 'NOT_EQUAL_TO', 0);

						if (sSearchText != undefined && sSearchText != '')
						{
							oSearch.addBracket('(');
							oSearch.addFilter('contactpersonpaidtotext', 'TEXT_IS_LIKE', sSearchText);
							oSearch.addOperator('or');
							oSearch.addFilter('contactbusinesspaidtotext', 'TEXT_IS_LIKE', sSearchText);
							oSearch.addOperator('or');
							oSearch.addFilter('description', 'TEXT_IS_LIKE', sSearchText);
							oSearch.addBracket(')');
						}

						if (iSearchBankAccount != -1)
						{
							oSearch.addFilter('bankaccount', 'EQUAL_TO', iSearchBankAccount);
						}

						if (sSearchDate != '' && sSearchDate != undefined)
						{
							oSearch.addFilter('accrueddate', 'LESS_THAN_OR_EQUAL_TO', sSearchDate);
						}

						oSearch.addSummaryField('sum(amount) totalamount')

						oSearch.rows = 100;
						oSearch.sort('paymentduedate', 'asc');
						oSearch.getResults(function(data) {ns1blankspace.financial.expense.outstanding.show(oParam, data)});
					}
					else
					{
						var aHTML = [];
						
						if (oResponse.data.rows.length == 0)
						{
							aHTML.push('<table id="ns1blankspaceInvoicingUnsent">' +
											'<tr><td class="ns1blankspaceSub">No outstanding expenses.</td></tr></table>');

							$('#ns1blankspaceExpenseOutstandingColumn1').html('');
						}
						else
						{
							var iPaymentAccount = ns1blankspace.util.getParam(oParam, 'paymentAccount').value;

							if (iPaymentAccount === undefined)
							{
								aHTML.push('<table class="ns1blankspaceColumn2">' +
											'<tr><td class="ns1blankspaceNothing" style="font-size:0.75em;">If you set up a ABA Direct Entry File payments account you can make bulk payments.</td></tr>' +
											'</table>');

								$('#ns1blankspaceExpenseOutstandingColumn2').html(aHTML.join(''));
							}
							else
							{
								var aHTML = [];
										
								aHTML.push('<table class="ns1blankspaceColumn2">');
										
								aHTML.push('<tr><td><span id="ns1blankspaceFinancialOutstandingFile-' + iPaymentAccount + '" class="ns1blankspaceAction ns1blankspaceFinancialOutstandingFile">' +
												'Create file</span></td></tr>');

								aHTML.push('<tr><td id="ns1blankspaceFinancialOutstandingFileStatus" style="padding-top:5px; font-size:0.75em; width:115px;" class="ns1blankspaceSub">' +
												'Create a bank file for payments</td></tr>');

								aHTML.push('<tr><td id="ns1blankspaceFinancialOutstandingMark_container-' + iPaymentAccount + '"></td></tr>');

								aHTML.push('</table>');					
								
								$('#ns1blankspaceExpenseOutstandingColumn2').html(aHTML.join(''));
												
								$('span.ns1blankspaceFinancialOutstandingFile').button(
								{
									label: 'Create file',
									icons:
									{
										primary: "ui-icon-document"
									}
								})
								.click(function()
								{	
									oParam.step = 1;
									ns1blankspace.financial.expense.outstanding.file(oParam)
								})
								.css('width', '130px');
							}

							var aHTML = [];

							aHTML.push('<table id="ns1blankspaceExpenseOutstanding" class="ns1blankspace" style="font-size:0.875em;">' +
										'<tr class="ns1blankspaceHeaderCaption">' +
										'<td class="ns1blankspaceHeaderCaption" style="width:10px;"><span class="ns1blankspaceExpenseOutstandingSelectAll"></span></td>' +
										'<td class="ns1blankspaceHeaderCaption" style="width:100px;">Contact</td>' +
										'<td class="ns1blankspaceHeaderCaption">Description</td>' +
										'<td class="ns1blankspaceHeaderCaption" style="width:50px; text-align:right;">Amount</td>' +
										'<td class="ns1blankspaceHeaderCaption" style="width:70px; text-align:right;">Due Date</td>' +
										'<td class="ns1blankspaceHeaderCaption" style="width:25px; text-align:right;">&nbsp;</td>' +
										'</tr>');

							$(oResponse.data.rows).each(function() 
							{
								aHTML.push(ns1blankspace.financial.expense.outstanding.row(this));
							});
							
							aHTML.push('</table>');
						}

						ns1blankspace.render.page.show(
						{
							type: 'JSON',
							xhtmlElementID: 'ns1blankspaceExpenseOutstandingColumn1',
							xhtmlContext: 'ExpenseOutstanding',
							xhtml: aHTML.join(''),
							showMore: (oResponse.morerows == "true"),
							more: oResponse.moreid,
							rows: 100,
							functionShowRow: ns1blankspace.financial.expense.outstanding.row,
							functionOpen: undefined,
							functionOnNewPage: ns1blankspace.financial.expense.outstanding.bind
						});   	

						var aHTML = [];
									
						aHTML.push('<table class="ns1blankspaceColumn2">');

						aHTML.push('<tr class="ns1blankspaceRadio">' +
										'<td id="ns1blankspaceDetailsBankAccount" class="ns1blankspaceRadio ns1blankspaceSubNote" style="font-size:0.75em;">' +
										'<input type="radio" id="radioBankAccount' + this.id + '" name="radioBankAccount" value="-1"/>' +
																'<b>All bank accounts</b><br />');

										$.each(ns1blankspace.financial.data.bankaccounts, function()
										{					
											aHTML.push('<input type="radio" id="radioBankAccount' + this.id + '" name="radioBankAccount" value="' + this.id + '"/>' +
																this.title.replace(/ /g,'&nbsp;') + '<br />');				
										});

						aHTML.push('<tr><td class="ns1blankspaceRadio ns1blankspaceSubNote" style="padding-top:14px; font-size:0.75em;">' +
										'<input type="radio" id="radioSearch1" name="radioSearch" value="salary for"/>' +
											'Salary<br />' +
										'<input type="radio" id="radioSearch2" name="radioSearch" value="superannuation"/>' +
											'Superannuation<br />' +
										'<input type="radio" id="radioSearch3" name="radioSearch" value="other"/>' +
											'Other<br />' +	
										'</td></tr>');

						aHTML.push('<tr class="ns1blankspaceCaption">' +
											'<td class="ns1blankspaceSubNote" style="padding-top:6px;">' +
											'Description contains' +
											'</td></tr>' +
											'<tr><td class="ns1blankspaceText" style="padding-top:2px;">' +
												'<input id="ns1blankspaceFinancialOutstandingSearchText" data-1blankspace="ignore" class="ns1blankspaceText" style="width:130px;">' +
												'</td></tr>');

						aHTML.push('<tr class="ns1blankspaceCaption">' +
											'<td class="ns1blankspaceSubNote">' +
											'Due date on or before' +
											'</td></tr>' +
											'<tr><td class="ns1blankspaceDate" style="padding-top:0px;">' +
											'<input id="ns1blankspaceFinancialOutstandingSearchDate" data-1blankspace="ignore" class="ns1blankspaceDate" style="width:130px;">' +
											'</td></tr>');
																			
						aHTML.push('<tr><td style="padding-top:0px;">' +
										'<span id="ns1blankspaceFinancialOutstandingSearch" class="ns1blankspaceAction">Search</span>' +
										'');

						if (sSearchText != undefined)
						{	
							aHTML.push('' +
										' <span id="ns1blankspaceFinancialOutstandingSearchClear" class="ns1blankspaceAction">Clear</span>' +
										'</td></tr>');
						}

						aHTML.push('<tr><td style="padding-top:15px; padding-bottom:0px; font-size:0.75em;" class="ns1blankspaceSub">' +
										'Selected expenses total</td></tr>');

						aHTML.push('<tr><td id="ns1blankspaceFinancialOutstandingTotal" style="padding-top:0px; font-size:1.2em; padding-bottom:16px;" class="ns1blankspaceSub">' +
										'</td></tr>');

						aHTML.push('</table>');

						if ($('#ns1blankspaceExpenseOutstandingColumn2 table').length == 0)
						{
							$('#ns1blankspaceExpenseOutstandingColumn2').html(aHTML.join(''));
						}
						else
						{
							$('#ns1blankspaceExpenseOutstandingColumn2 table').before(aHTML.join(''));
						}

						ns1blankspace.util.initDatePicker({select: '#ns1blankspaceFinancialOutstandingSearchDate'});

						$('[name="radioBankAccount"][value="' + iSearchBankAccount + '"]').attr('checked', 'checked');
						$('[name="radioSearch"][value="' + sSearchType + '"]').attr('checked', 'checked');

						$('[name="radioBankAccount"]').click(function() 
						{
							oParam = ns1blankspace.util.setParam(oParam, 'searchBankAccount', $(this).val());
							ns1blankspace.financial.expense.outstanding.show(oParam);
						});

						$('[name="radioSearch"]').click(function() 
						{
							oParam = ns1blankspace.util.setParam(oParam, 'searchType', $(this).val());

							if ($(this).val() != 'other')
							{
								$('#ns1blankspaceFinancialOutstandingSearchText').val($(this).val())
							}
							else
							{
								$('#ns1blankspaceFinancialOutstandingSearchText').val('')
							}

							oParam = ns1blankspace.util.setParam(oParam, 'searchText', $('#ns1blankspaceFinancialOutstandingSearchText').val());
							ns1blankspace.financial.expense.outstanding.show(oParam);
						});

						$('#ns1blankspaceFinancialOutstandingSearch').button(
						{
							label: 'Search'
						})
						.click(function() 
						{
							oParam = ns1blankspace.util.setParam(oParam, 'searchText', $('#ns1blankspaceFinancialOutstandingSearchText').val());
							oParam = ns1blankspace.util.setParam(oParam, 'searchDate', $('#ns1blankspaceFinancialOutstandingSearchDate').val());
							ns1blankspace.financial.expense.outstanding.show(oParam);
						})
						.css('width', '65px');

						$('#ns1blankspaceFinancialOutstandingSearchClear').button(
						{
							label: 'Clear'
						})
						.click(function() 
						{
							oParam = ns1blankspace.util.setParam(oParam, 'searchType', 'other');
							oParam = ns1blankspace.util.setParam(oParam, 'searchText', '');
							oParam = ns1blankspace.util.setParam(oParam, 'searchDate', '');
							ns1blankspace.financial.expense.outstanding.show(oParam);
						})
						.css('width', '57px');

						$('#ns1blankspaceFinancialOutstandingSearchText').keyup(function(e)
						{
							if (e.which === 13)
					    	{
					    		oParam = ns1blankspace.util.setParam(oParam, 'searchText', $('#ns1blankspaceFinancialOutstandingSearchText').val());
					    		oParam = ns1blankspace.util.setParam(oParam, 'searchDate', $('#ns1blankspaceFinancialOutstandingSearchDate').val());
					    		ns1blankspace.financial.expense.outstanding.show(oParam);
					    	}
						});				

						$('#ns1blankspaceFinancialOutstandingSearchText').val(sSearchText);
						$('#ns1blankspaceFinancialOutstandingSearchDate').val(sSearchDate);

						ns1blankspace.financial.expense.outstanding.refresh();
						ns1blankspace.financial.expense.outstanding.banks();
					}
				},

	banks:	function (oParam, oResponse)
				{
					if (oResponse == undefined)
					{
						var bankAccounts = _.filter(ns1blankspace.financial.data.bankaccounts, function (bankAccount)
						{
							return (bankAccount.bank != '')
						});

						bankAccounts = _.map(bankAccounts, function (bankAccount)
						{
							return bankAccount.bank
						});

						if (bankAccounts.length != 0)
						{
							var oSearch = new AdvancedSearch();
							oSearch.method = 'CORE_URL_SEARCH';		
							oSearch.addField('title,url');
							oSearch.addFilter('title', 'IN_LIST', bankAccounts.join(','));
							oSearch.addFilter('url', 'TEXT_IS_NOT_EMPTY');
							oSearch.sort('private', 'desc');
							oSearch.getResults(function(data) {ns1blankspace.financial.expense.outstanding.banks(oParam, data)});
						}	
					}
					else
					{
						var aHTML = [];

						if (oResponse.data.rows.length != 0)
						{
							aHTML.push('<table class="ns1blankspaceColumn2" style="margin-top:0px; width:90%;">');

							aHTML.push('<tr><td class="ns1blankspaceHeaderCaption" style="padding-top:10px;"></td></tr>')
										
							$.each(oResponse.data.rows, function (r, oRow)
							{
								aHTML.push('<tr><td style="font-size:0.825em;padding-top:6px;"><a href="' + (oRow.url.indexOf('http')==-1?'http://':'') + oRow.url + '" target="_blank">' +
										 oRow.title + '</a></td></tr>');
							});

							aHTML.push('</table>')

							$('#ns1blankspaceExpenseOutstandingColumn2 table').last().after(aHTML.join(''));
						}
					}
				},			

	row: 		function (oRow)	
				{
					var aHTML = [];

					oRow.hasEmail = false;
					
					var sContact = oRow['contactbusinesspaidtotext'];
					if (sContact == '') {sContact = oRow['contactpersonpaidtotext']}

					ns1blankspace.financial.expense.outstanding.data.expenses.push(oRow);

					aHTML.push('<tr class="ns1blankspaceRow">' +
									'<td class="ns1blankspaceRow ns1blankspaceSub" id="ns1blankspaceExpenseOutstanding_selectContainer-' + oRow["id"] + '">' +
									'<input type="checkbox" checked="checked" id="ns1blankspaceExpenseOutstanding_select-' + oRow["id"] + '"' + 
									' title="' + oRow["reference"] + '"' +
									' data-outstandingamount="' + oRow["outstandingamount"].replace(',', '') + '" /></td>');

					aHTML.push('<td id="ns1blankspaceExpenseOutstanding_contact-' + oRow["id"] + '" class="ns1blankspaceRow">' +
										sContact + '</td>');

					aHTML.push('<td id="ns1blankspaceExpenseOutstanding_description-' + oRow["id"] + '" class="ns1blankspaceRow">' +
									'<div>' + oRow["description"] + '</div><div class="ns1blankspaceSubNote">' + oRow["reference"] + '</div></td>');

					aHTML.push('<td id="ns1blankspaceExpenseOutstanding_amount-' + oRow["id"] + '" class="ns1blankspaceRow" style="text-align:right;">' +
									oRow["outstandingamount"] + '</td>'); 

					aHTML.push('<td id="ns1blankspaceexpenseoutstanding_paymentduedate-' + oRow["id"] + '" class="ns1blankspaceRow ns1blankspaceSub" style="text-align:right;">' +
									ns1blankspace.util.fd(oRow["paymentduedate"]) + '</td>');

					aHTML.push('<td style="text-align:right;" class="ns1blankspaceRow">');

					aHTML.push('<span style="margin-right:5px;" id="ns1blankspaceExpenseOutstanding_option_preview-' + oRow['id'] + '"' +
									' class="ns1blankspaceRowPreview"></span>');

					aHTML.push('<span id="ns1blankspaceExpenseOutstanding_option-' + oRow['id'] + '-1"' +
									' class="ns1blankspaceRowView"></span></td>');
					aHTML.push('</tr>');

					return aHTML.join('');
				},

	bind: 	function ()
				{
					$('#ns1blankspaceExpenseOutstanding .ns1blankspaceRowView').button(
					{
						text: false,
						icons:
						{
							primary: "ui-icon-play"
						}
					})
					.click(function() {
						ns1blankspace.financial.expense.init({id: (this.id).split('-')[1]});
					})
					.css('width', '15px')
					.css('height', '20px');

					$('.ns1blankspaceExpenseOutstandingSelectAll').button(
					{
						text: false,
						icons:
						{
							primary: "ui-icon-check"
						}
					})
					.click(function()
					{	
						$('#ns1blankspaceExpenseOutstanding input').each(function () {$(this).prop('checked', !($(this).prop('checked')))});
						ns1blankspace.financial.expense.outstanding.refresh();
					})
					.css('width', '14px');

					$('#ns1blankspaceExpenseOutstanding input:checked').click(function()
					{	
						ns1blankspace.financial.expense.outstanding.refresh();
					})

					ns1blankspace.financial.expense.outstanding.refresh();			
				},

	refresh: function ()
				{
					var cTotal = _.sum(_.map($('#ns1blankspaceExpenseOutstandingColumn1 input:checked'), function (input) {return _.toNumber($(input).attr('data-outstandingamount'))}));
					var sTotal = ns1blankspace.option.currencySymbol + _.toNumber(cTotal).formatMoney(2, '.', ',');
					$('#ns1blankspaceFinancialOutstandingTotal').html(sTotal)
				},			

	file: 	function (oParam)
				{
					var iStep = ns1blankspace.util.getParam(oParam, 'step', {"default": 1}).value;
					var iDataIndex = ns1blankspace.util.getParam(oParam, 'dataIndex', {"default": 0}).value;
					var iDataItemIndex = ns1blankspace.util.getParam(oParam, 'dataItemIndex', {"default": 0}).value;
					var iPaymentAccount = ns1blankspace.util.getParam(oParam, 'paymentAccount').value;
					var iFundsTransfer = ns1blankspace.util.getParam(oParam, 'fundsTransfer').value;

					if (oParam === undefined)
					{	
						oParam = {}
					}			

					if (iStep == 1)
					{	
						ns1blankspace.status.working('Creating file...');
						ns1blankspace.financial.expense.outstanding.data.toBePaid = [];

						if ($('#ns1blankspaceExpenseOutstanding input:checked').length > 0)
						{	
							$('#ns1blankspaceFinancialOutstandingFileStatus').html('<span style="font-size:2.25em;" class="ns1blankspaceSub">' +
										'<span id="ns1blankspaceFinancialOutstandingFileStatusIndex">1</span>/' + $('#ns1blankspaceExpenseOutstanding input:checked').length + 
										'</span>');
						}
						else
						{
							ns1blankspace.status.error('No expenses selected')
						}	

						$('#ns1blankspaceExpenseOutstanding input:checked').each(function() 
						{
							var iID = (this.id).split('-')[1]

							var oData = $.grep(ns1blankspace.financial.expense.outstanding.data.expenses, function (a) {return a.id == iID;})[0]

							if (oData)
							{
								ns1blankspace.financial.expense.outstanding.data.toBePaid.push(oData);
							}
						});

						oParam.step = 2;
						ns1blankspace.financial.expense.outstanding.file(oParam);
					}			

					if (iStep == 2)
					{
						var oData =
						{
							fundstransferaccount: iPaymentAccount
						}
						
						$.ajax(
						{
							type: 'POST',
							url: ns1blankspace.util.endpointURI('FINANCIAL_TRANSFER_MANAGE'),
							data: oData,
							dataType: 'json',
							success: function(data)
							{
								oParam.fundsTransfer = data.id;
								oParam.step = 3;
								ns1blankspace.financial.expense.outstanding.file(oParam, data)
							}
						});
					}	

					if (iStep == 3)
					{
						if (iDataIndex < ns1blankspace.financial.expense.outstanding.data.toBePaid.length)
						{	
							$('#ns1blankspaceFinancialOutstandingFileStatusIndex').html(iDataIndex + 1);

							var oData = ns1blankspace.financial.expense.outstanding.data.toBePaid[iDataIndex];

							$('#ns1blankspaceExpenseOutstanding_option_preview-' + oData.id).html(ns1blankspace.xhtml.loadingSmall)

							var oSearch = new AdvancedSearch();
							oSearch.method = 'FINANCIAL_ITEM_SEARCH';
							oSearch.addField('financialaccounttext,tax,issuedamount,amount,expenseoutstandingamount,description,object');
							oSearch.addFilter('object', 'EQUAL_TO', 2);
							oSearch.addFilter('objectcontext', 'EQUAL_TO', oData.id);
							oSearch.addFilter('expenseoutstandingamount', 'GREATER_THAN', 0);

							oSearch.sort('id', 'asc');
							oSearch.getResults(function(oResponse)
							{
								$('#ns1blankspaceExpenseOutstanding_option_preview-' + oData.id).html('');
								$('#ns1blankspaceExpenseOutstanding_option_preview-' + oData.id).addClass('ns1blankspaceRowPreviewDone');

								$('#TODOns1blankspaceExpenseOutstanding_option_preview-' + oData.id).button(
								{
									text: false,
									icons:
									{
										primary: "ui-icon-document"
									}
								})
								.click(function() {
									ns1blankspace.financial.expense.outstanding.file.showHide({xhtmlElementID: this.id});
								})
								.css('width', '15px')
								.css('height', '20px');

								ns1blankspace.financial.expense.outstanding.data.toBePaid[iDataIndex].items = oResponse.data.rows;

								oParam.dataIndex = iDataIndex + 1;
								ns1blankspace.financial.expense.outstanding.file(oParam);
							});
						}
						else
						{
							delete oParam.dataIndex;
							oParam.step = 4;
							ns1blankspace.financial.expense.outstanding.file(oParam);
						}	
					}

					if (iStep == 4)
					{
						var aItems = [];

						$.each(ns1blankspace.financial.expense.outstanding.data.toBePaid, function (i, v)
						{
							$.each(v.items, function (j, k)
							{
								aItems.push(k.id);
							});
						});

						var oData =
						{
							transfer: iFundsTransfer,
							lineitem: aItems.join(',')
						}
						
						$.ajax(
						{
							type: 'POST',
							url: ns1blankspace.util.endpointURI('FINANCIAL_TRANSFER_EXPENSE_MANAGE'),
							data: oData,
							dataType: 'json',
							success: function(data)
							{
								oParam.step = 5;
								ns1blankspace.financial.expense.outstanding.file(oParam);
							}	
						});
					}

					if (iStep == 5)
					{
						var oData =
						{
							id: iFundsTransfer,
						}
						
						$.ajax(
						{
							type: 'POST',
							url: ns1blankspace.util.endpointURI('FINANCIAL_TRANSFER_CREATE_FILE'),
							data: oData,
							dataType: 'json',
							success: function(data)
							{	
								ns1blankspace.status.message('File created');
								$('#ns1blankspaceFinancialOutstandingFileStatus').html('<a target="_blank" href="/download/' + data.attachmentlink + '"">Download</a>');

								$('#ns1blankspaceFinancialOutstandingMark_container-' + iPaymentAccount).html(
									'<span id="ns1blankspaceFinancialOutstandingMark-' + iPaymentAccount + '" class="ns1blankspaceAction ns1blankspaceFinancialOutstandingMark">' +
												'Mark as paid</span><br />' + 
												'<div style="padding-top:5px; font-size:0.75em;" class="ns1blankspaceSub">' +
												'Create payments for the expenses in the file.</div>');

								$('span.ns1blankspaceFinancialOutstandingMark').button(
								{
									label: 'Mark as paid',
									icons:
									{
										primary: "ui-icon-check"
									}
								})
								.click(function()
								{	
									if (confirm('Have you downloaded the file? Cancel to do it now.'))
									{
										oParam.step = 6;
										ns1blankspace.financial.expense.outstanding.file(oParam)
									}
								})
								.css('width', '130px');
							}	
						});
					}

					if (iStep == 6)
					{
						ns1blankspace.status.working('Creating payments...');

						var oData =
						{
							id: iFundsTransfer,
						}
						
						$.ajax(
						{
							type: 'POST',
							url: ns1blankspace.util.endpointURI('FINANCIAL_TRANSFER_CREATE_PAYMENTS'),
							data: oData,
							dataType: 'json',
							success: function(data)
							{	
								

								ns1blankspace.status.message(data.count + ' payment' + (data.count=1?'':'s') + ' created');
								ns1blankspace.financial.expense.outstanding.init();
							}	
						});
					}	
				}												
}