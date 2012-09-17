Ext.define('ST2.controller.CompanyAgreement', {
	extend: 'Ext.app.Controller',
	
	config: {
		refs: {
			companyAgreementForm: 'companyagreementform',
			submitCompanyAgreementButton: 'companyagreementform [action=submit]'
		},
		control: {
			submitCompanyAgreementButton: {
				tap: 'onCompanyAgreementFormSubmit'
			}
		}
	},	

	onCompanyAgreementFormSubmit: function(){
		console.log('on company agreement form submit.');
		var formValues = this.getCompanyAgreementForm().getValues();
		formValues.clientSignature = Ext.getCmp('clientSignaturePanel').getPlugins()[0].getSignatureAsImage("DATA");
		formValues.managerSignature = Ext.getCmp('managerSignaturePanel').getPlugins()[0].getSignatureAsImage("DATA");
			
		console.log('form values = %o', formValues);
		
		
		Ext.getCmp('clientSignaturePad').hide();
		Ext.getCmp('clearClientSignatureContainer').hide();
		Ext.getCmp('clientSignature').show();
		Ext.getCmp('clientSignature').setSrc(formValues.clientSignature);

		
		Ext.getCmp('managerSignaturePad').hide();
		Ext.getCmp('clearManagerSignatureContainer').hide();
		Ext.getCmp('managerSignature').show();
		Ext.getCmp('managerSignature').setSrc(formValues.managerSignature);
		
	}
});