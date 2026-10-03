(function(){
  function findCalculatorButton(target){
    const form=target.closest('form');
    if(form){
      const button=form.querySelector('button[type="submit"], button.button-main');
      if(button) return button;
    }

    // This shared script is loaded only on calculator pages. Find the nearest
    // ancestor owning exactly one primary calculation button, so new layouts
    // do not require a page-specific Enter handler.
    let node=target.parentElement;
    while(node && node !== document.body){
      const buttons=node.querySelectorAll('button.button-main');
      if(buttons.length === 1) return buttons[0];
      node=node.parentElement;
    }
    return null;
  }

  function enableEnterToCalculate(){
    document.addEventListener('keydown', function(event){
      if(event.key !== 'Enter' || event.isComposing) return;
      const target=event.target;
      if(!target || target.tagName !== 'INPUT' || target.type === 'hidden') return;
      const button=findCalculatorButton(target);
      if(!button || button.disabled) return;
      event.preventDefault();
      button.click();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      enableEnterToCalculate();
    }, {once:true});
  } else {
    enableEnterToCalculate();
  }
})();