Ext.define("ST2.view.Main", {
	extend: 'Ext.form.Panel',
	xtype: 'companyagreementform',
	
	requires: ['ST2.plugin.SignaturePad', 
	           'Ext.form.FieldSet',
	           'Ext.field.DatePicker',
	           'Ext.field.Email',
	           'Ext.Img'],
    
    config: {
        tabBarPosition: 'bottom',

        
		items: [
		    {
		    	xtype: 'toolbar',
		    	cls: 'title',
		    	title: 'Customer Approval',
		    	docked: 'top'
		    },
		    {
		    	xtype: 'image',
		    	id: 'clientSignature',
		    	hidden: true,
		    	style: 'width: 500px; height: 230px; margin: 10px auto;'
		    },
		    {		    	
		    	xtype: 'fieldset',
		    	id: 'clientSignaturePad',
		    	title: 'Signature Please',
		    	instructions: 'I certify that the agent has performed the requested maintenance as outlined in the service level agrement.',
		    	
		    	items: [
	    	        { 
	    	        	id: 'clientSignaturePanel',
	    	        	xtype: 'panel',
	    	        	style: 'width: 500px; height: 230px; margin: 10px auto;',
	    	        	
	    	        	plugins: [ 
	        	           {
	        	        	   xclass: 'ST2.plugin.SignaturePad',
	        	        	   disableScrollCmp: 'companyagreementform',
	        	        	   canvasId: 'signature',
	        	        	   width: 500, 
	        	        	   height: 230 
	        	           }
        	            ]
	    	        }	    	        
    	        ]
		    },
		    {
		    	id: 'clearClientSignatureContainer',
				xtype: 'container',
				layout: { type: 'hbox', pack: 'end' },
				items: [{
		        	xtype: 'button',
		        	pack: 'left',
		        	text: 'Clear',
		        	ui: 'action',
		        	handler: function() {
		        		Ext.getCmp('clientSignaturePanel').getPlugins()[0].reset();
		        	}
		        }]
			},
		    
			{
				xtype: 'fieldset',
				title: 'Client Information',
	
				defaults: {
					labelWidth: '150px'
				},
				
				items: [
					{ 
						xtype: 'textfield',
						name: 'fullname',
						label: 'Name'
					},
					{ 
						xtype: 'textfield',
						name: 'ssn',
						label: 'SSN'
					}				
				] 	
			},
			{
				xtype: 'fieldset',
				
				defaults: {
					labelWidth: '150px'
				},
				
				items: [					
					{ 
						xtype: 'emailfield',
						name: 'email',
						label: 'Email'
					},
					{ 
						xtype: 'textfield',
						name: 'phone',
						label: 'Phone'
					},
					{ 
						xtype: 'textfield',
						name: 'address',
						label: 'Address'
					},
					{ 
						xtype: 'textfield',
						name: 'city',
						label: 'City'
					},
					{ 
						xtype: 'textfield',
						name: 'state',
						label: 'State'
					},
					{ 
						xtype: 'textfield',
						name: 'zip',
						label: 'Zip'
					},
					{
						xtype: 'checkboxfield',
						name: 'agree',
						label: 'I Agree'
					}	
				]
			},	
			{
		    	xtype: 'image',
		    	id: 'managerSignature',
		    	hidden: true,
		    	style: 'width: 500px; height: 230px; margin: 10px auto;'
		    },
			{
	 	    	   xtype: 'fieldset',
	 	    	   title: 'Manager\'s Signature',
	 	    	   id: 'managerSignaturePad',
	 	    	   
	 	    	   items: [
	 					{ 
	 						id: 'managerSignaturePanel',
	 						xtype: 'panel',
	 						style: 'width: 500px; height: 230px; margin: 10px auto;',
	 						
	 						plugins: [ 
	 					       {
	 					    	   xclass: 'ST2.plugin.SignaturePad',
	 					    	   disableScrollCmp: 'companyagreementform',
	 					    	   canvasId: 'caManagerSignatureCanvas',
	 					    	   width: 500, 
	 					    	   height: 230 
	 					       }
	 					    ]
	 					},
	 					{
	 						xtype: 'datepickerfield',
	 						label: 'Date',
	 						name: 'created_on',
	 						value: new Date(),
	 						readOnly: true
	 					}							
	 	           ]	    	    	   
	 	     },	
	 	     {
	 	    	id: 'clearManagerSignatureContainer',
				xtype: 'container',
				layout: { type: 'hbox', pack: 'end' },
				items: [{
		        	xtype: 'button',
		        	pack: 'left',
		        	text: 'Clear',
		        	ui: 'action',
		        	handler: function() {
		        		Ext.getCmp('managerSignaturePanel').getPlugins()[0].reset();
		        	}
		        }]
			},
			{
				xtype: 'panel',
				style: 'margin: 0 0 1.5em;',
			},
			{
				action: 'submit',
				xtype: 'button',
				text: 'Submit',
				ui: 'confirm'
			}		
		]	
	}
});
