let emojisGlobal = [];

class t2marketbot_tk {
  constructor () {
    let aT = this.getAccessToken();
    if(!aT || aT.length < 100) return false; // no authorization
    

    if (!document.getElementById('t2_inter_font')) {
      let link = document.createElement('link');
      link.id = 't2_inter_font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }


    
    let this_ = this;

    this.sets = {
      lotUom: 'min',
      lotVolume: 50,
      lotPrice: 40,
      nameCheckbox: true,
      autoConfirmPremium: false,
      ems: [],
    };
    this.busyCount = 0;
    this.monthInMs = 2678400000;
    this.rests = {'gb':0,'min':0,'sms':0};
    this.positionTimeouts = [];
    this.activeTab = 'all';
    
    let s = readFromStorage('t2_sets');
    if(s)
      this.sets = s;

    let phoneNum = JWT_to_JSON(aT).current_username;
    this.preferred_username = JWT_to_JSON(aT).preferred_username;
    this.phoneNum = phoneNum;
    this.baseUrl = 'https://'+document.location.host+'/api/subscribers/'+phoneNum+'/exchange/lots/created';

    let div = document.createElement('div');
    div.className = 't2marketbot_tk displayNone';
    div.innerHTML = 
'   <div class="appWindowsHeader">'+
'     <div style="display: flex; align-items: center; gap: 8px;">'+
'       <div class="phoneNumBoxWrapper">'+    
'         <div class="phoneNumberBlock">'+formatPhoneNumber(phoneNum)+'</div>'+
'       </div>'+
'       <div class="headerLoader"></div>'+
'     </div>'+
'     <div class="restsBlock"></div>'+
'     <div class="closeButton"></div>'+
'   </div>'+
'   <div class="elementsWrapper">'+
'     <div class="element" style="display: flex; flex-direction: column; gap: 8px; align-items: center;">'+
'       <div style="display: flex; align-items: center; gap: 6px; justify-content: center; width: 100%;">'+
'         <input value="50" type="number" class="lotVolume">'+
'         <select class="lotUom">'+
'           <option value="min">МИН</option>'+
'           <option value="gb">ГБ</option>'+
'           <option value="sms">SMS</option>'+
'         </select> '+
'         <div style="position: relative; display: inline-flex; align-items: center;">'+
'           <input value="40" type="number" class="lotPrice">'+
'           <span style="position: absolute; right: -16px; font-size: 14px; font-weight: bold; color: var(--t2-text);">₽</span>'+
'         </div>'+
'       </div>'+
'       <div style="display: flex; gap: 5px; justify-content: center; width: 100%; padding: 0 4px; box-sizing: border-box;">'+
'         <button type="button" class="quickVolBtn" data-val="min">MIN</button>'+
'         <button type="button" class="quickVolBtn" data-val="-100">-100</button>'+
'         <button type="button" class="quickVolBtn" data-val="-5">-5</button>'+
'         <button type="button" class="quickVolBtn" data-val="-1">-1</button>'+
'         <button type="button" class="quickVolBtn" data-val="1">+1</button>'+
'         <button type="button" class="quickVolBtn" data-val="5">+5</button>'+
'         <button type="button" class="quickVolBtn" data-val="100">+100</button>'+
'         <button type="button" class="quickVolBtn" data-val="max">MAX</button>'+
'       </div>'+
'       <div style="display: flex; gap: 20px; justify-content: center; margin-top: 4px; margin-bottom: 2px;">'+
'         <label class="customCheckboxContainer"><input checked type="checkbox" class="nameCheckbox"><span class="customCheckbox"></span>Имя продавца</label>'+
'         <label class="customCheckboxContainer"><input type="checkbox" class="autoConfirmPremiumCheckbox"><span class="customCheckbox"></span>Без подтв. 5₽</label>'+
'       </div>'+
'     </div>'+
'     <div class="element" style="display: flex; flex-direction: column; align-items: center; gap: 8px; border-top: 1px solid var(--t2-border); padding-top: 10px;">'+
'       <div style="display:flex; justify-content: center; width: 100%;">'+
'         <div class="allEmBlock disable-select" style="display: flex; gap: 6px; justify-content: center;">'+
'           <span class="emBomb emButton" data-name="bomb"></span>'+
'           <span class="emCat emButton" data-name="cat"></span>'+
'           <span class="emCool emButton" data-name="cool"></span>'+
'           <span class="emDevil emButton" data-name="devil"></span>'+
'           <span class="emRich emButton" data-name="rich"></span>'+
'           <span class="emTongue emButton" data-name="tongue"></span>'+
'           <span class="emScream emButton" data-name="scream"></span>'+
'           <span class="emZipped emButton" data-name="zipped"></span>'+
'         </div>'+
'       </div>'+
'       <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 6px;">'+
'         <span style="font-size: 12px; color: #888; width: 75px; text-align: right; margin-right: 8px; display: inline-block;">Выбранные:</span>'+
'         <div class="selectedEmBlock"></div>'+
'         <div style="width: 75px; margin-left: 8px; display: inline-block; text-align: left;">'+
'           <span class="emDel emButton emButtonDel emButton" data-name="del" style="vertical-align: middle; margin: 0;"></span>'+
'         </div>'+
'       </div>'+
'     </div>'+
'     <div class="element statsWrapper" style="font-size: 13px; border-top: 1px solid var(--t2-border); border-bottom: 1px solid var(--t2-border); display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; gap: 8px;">'+
'       <div style="display: flex; gap: 12px;">'+
'         <div>Продано сегодня: <span class="statsToday" style="font-weight: bold; color: #1fb141;">0 ₽</span></div>'+
'         <div>За все время: <span class="statsAllTime" style="font-weight: bold; color: #1fb141;">0 ₽</span></div>'+
'       </div>'+
'       <button type="button" class="resetStatsBtn" title="Сбросить статистику" style="background: transparent; border: none; cursor: pointer; padding: 0; font-size: 15px; color: #8a8d99; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; transition: all 0.2s ease-in-out;">🗑️</button>'+
'     </div>'+
'     <div class="element buttonsWrapper"></div>'+
'   </div>' +
'   <div class="element msgBoxWrapper displayNone">'+
'     <div class="msgBox"></div>'+
'   </div>'+
'   <div class="lotsTabHeader">'+
'     <div class="lotsTab active" data-tab="all">Все</div>'+
'     <div class="lotsTab" data-tab="active">Активные</div>'+
'     <div class="lotsTab" data-tab="bought">Проданные</div>'+
'   </div>'+
'   <div class="lotsWrapper"></div>';

    $('body').append(div);

    let showBlockButton = document.createElement('div');
    showBlockButton.className = 'showBlockButton';
    let iconUrl = '';
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        iconUrl = chrome.runtime.getURL('icon.png');
      }
    } catch (e) {}
    if (iconUrl) {
      showBlockButton.style.backgroundImage = 'url(' + iconUrl + ')';
    }
    $(div).after(showBlockButton);
    
    let buttonAdd = document.createElement('button');
    buttonAdd.innerHTML = 'Создать лот';
    buttonAdd.type = 'button';
    buttonAdd.className = 'btn btn-black myBtn btn-primary-action';

    let buttonDelAll = document.createElement('button');
    buttonDelAll.innerHTML = 'Удалить все лоты';
    buttonDelAll.type = 'button';
    buttonDelAll.className = 'btn btn-black myBtn btn-danger-action';

    let getLostButton = document.createElement('button');
    getLostButton.innerHTML = 'Обновить';
    getLostButton.type = 'button';
    getLostButton.className = 'btn btn-black myBtn btn-secondary-action';

    $('.buttonsWrapper').append(buttonAdd);
    $('.buttonsWrapper').append(buttonDelAll);
    $('.buttonsWrapper').append(getLostButton);

    
    $(window).on('resize', () => this_.changeLotsWrapperHeight());
    $(getLostButton).on('click', () => {
      this_.getRests();
      this_.getLots();
    });
    $('.msgBox').on('click', () => this_.msgBox(''));
    $(buttonAdd).on('click', () => this_.addLot());
    $(buttonDelAll).on('click', () => this_.deleteAllLots());
    $(showBlockButton).on('click', () => this_.expand());
    $('.lotUom').on('change', function() {
      let val = $(this).val();
      if (val === 'gb') {
        $('.lotVolume').val(1);
      } else if (val === 'min' || val === 'sms') {
        $('.lotVolume').val(50);
      }
    });
    $('.lotVolume, .lotUom').on('change', () => this_.setMinCost());
    $('.lotVolume, .lotPrice, .lotUom, .nameCheckbox, .autoConfirmPremiumCheckbox').on('change input', () => this_.saveFields());
    $('body').on('click', '.quickVolBtn', function() {
      let val = $(this).attr('data-val');
      let volInput = $('.lotVolume');
      let currentVal = parseInt(volInput.val()) || 0;
      let uom = $('.lotUom').val();
      
      if (val === 'max') {
        let maxVal = this_.rests[uom] || 0;
        volInput.val(maxVal);
      } else if (val === 'min') {
        let minVal = (uom === 'gb') ? 1 : 50;
        volInput.val(minVal);
      } else {
        let newVal = currentVal + parseInt(val);
        let minVal = (uom === 'gb') ? 1 : 50;
        if (newVal < minVal) newVal = minVal;
        volInput.val(newVal);
      }
      volInput.trigger('change');
      this_.setMinCost();
    });
    $('body').on('click', '.lotsTab', function() {
      $('.lotsTab').removeClass('active');
      $(this).addClass('active');
      this_.activeTab = $(this).attr('data-tab');
      this_.getLots();
    });
    $('.closeButton').on('click', () => this_.hide());
    $('.resetStatsBtn').on('click', () => {
      if (window.confirm("Сбросить всю статистику продаж?")) {
        writeToStorage('t2_trade_log', []);
        this_.updateTradeLogUI();
      }
    });

    
    
    $('.emButton').each(function () {
      let $this = $(this);
      $this.on('click', function () {
        this_.selectEm($(this).data('name'));
      });
    });
    
    
    this_.changeLotsWrapperHeight();
    this_.fillFields();
    this_.getLots();
    this_.getRests();
    this_.updateTradeLogUI();
        
    let t2_isExpand = readFromStorage('t2_isExpand');
    if(t2_isExpand)
      this.expand();
  }

  getAccessToken () {
    return (document.cookie.match('(^|; )access_token=([^;]*)')||0)[2];
  }

  msgBox (msg, color) {
    let this_ = this;
    if (this_.msgBoxTimeout) {
      clearTimeout(this_.msgBoxTimeout);
    }
    
    if (!msg) {
      $('.msgBoxWrapper').addClass('displayNone');
      $('.msgBox').html('');
    } else {
      $('.msgBoxWrapper').removeClass('displayNone');
      if(color)
        $('.msgBox').html('<span style="color:'+color+'">'+msg+'</span>');
      else
        $('.msgBox').html('<span>'+msg+'</span>');
        
      let duration = (color === 'red' || color === 'orange') ? 7000 : 3500;
      this_.msgBoxTimeout = setTimeout(() => {
        this_.msgBox('');
      }, duration);
    }
    this.changeLotsWrapperHeight();
  }
  
  fillFields () {
    try{
      $('.lotVolume').val(this.sets.lotVolume);
      $('.lotPrice').val(this.sets.lotPrice);
      $('.lotUom').val(this.sets.lotUom);
      $('.nameCheckbox').prop('checked', this.sets.nameCheckbox);
      $('.autoConfirmPremiumCheckbox').prop('checked', this.sets.autoConfirmPremium || false);
      
      let that = this;
      this.selectEm('del');
      this.sets.ems.forEach((it) => {
        that.selectEm(it);
      });
    } catch(e){}
  }
  
  saveFields () {
    this.sets = {
      lotUom: $('.lotUom').val(),
      lotVolume: parseInt( $('.lotVolume').val() ),
      lotPrice: parseInt( $('.lotPrice').val() ),
      nameCheckbox: $('.nameCheckbox').prop('checked'),
      autoConfirmPremium: $('.autoConfirmPremiumCheckbox').prop('checked'),
      ems: emojisGlobal,
    };
    writeToStorage('t2_sets', this.sets);
  }


  selectEm (em) {
    if (em == 'del') {
      $('.selectedEmBlock').html('');
      emojisGlobal = [];
    } else {
      if (emojisGlobal.length < 3) {
        emojisGlobal.push(em);
        let img = document.createElement('span');
        img.className = 'emButton em' + em.charAt(0).toUpperCase() + em.slice(1);
        $('.selectedEmBlock').append(img);
      }
    }
  }
  
  addLotToList (item, edit, isNew) {
    let this_ = this;
    clearTimeout(this_.positionTimeouts[item.id]);
    
    let html = '';
    let emojis = '';
    let emojisStr = '';
    let date = timeConverter(Date.parse(item.creationDate));
    for (let i = 0; i < item.seller.emojis.length; i++) {
        emojis += '<span class="em'+item.seller.emojis[i].charAt(0).toUpperCase() + item.seller.emojis[i].slice(1)+' lotEmojis"></span>';
        emojisStr += ' ' + item.seller.emojis[i];
    }

    
    let name = item.seller.name == null || item.seller.name == '' ? 'Аноним' : item.seller.name;
    let lot = document.createElement('div');

    let volume = item.volume.value;
    switch (item.volume.uom) {
        case "min":
            volume += ' мин.';
            break;
        case "sms":
            volume += ' SMS';
            break;
        case "gb":
            volume += ' Гб';
            break;
    }
    let cost = item.cost.amount + ' ₽';
    let expText = item.expirationDate ? getRemainingTimeText(item.expirationDate) : '';
    let premiumOps = item.premiumOps !== undefined ? item.premiumOps : 5;

    let badgeClass = '';
    let badgeText = '';
    switch (item.volume.uom) {
        case "gb":
            badgeClass = 'badgeGb';
            badgeText = 'ГБ';
            break;
        case "min":
            badgeClass = 'badgeMin';
            badgeText = 'МИН';
            break;
        case "sms":
            badgeClass = 'badgeSms';
            badgeText = 'SMS';
            break;
    }
    let trafficBadge = '<span class="trafficBadge ' + badgeClass + '">' + badgeText + '</span>';

    html = '<div class="lotCardBody">' +
           '  <div class="lotCardRow lotHeaderRow">' +
           '    <span class="lotDateText">' + date + ' ' + (expText ? '<span class="lotExpiration">' + expText + '</span>' : '') + '</span>' +
           '    <span class="lotSeller">' + name + '</span>' +
           '  </div>' +
           '  <div class="lotCardRow lotDataRow">' +
           '    <span class="lotStats">' + trafficBadge + ' ' + volume + ' за <span class="lotPriceHighlight">' + cost + '</span></span>' +
           '    <span class="lotEmojisContainer">' + emojis + '</span>' +
           '  </div>' +
           '</div>' +
           '<div class="lotMetaRightCol">' +
           '  <span class="lotPremiumOpsBadge"><span class="opsRocket">🚀</span><span class="opsVal">' + premiumOps + '</span></span>' +
           '  <span class="lotPositionBadge is-infinite">∞</span>' +
           '</div>';
    
    let delButton = document.createElement('button');
    let editButton = document.createElement('button');
    let bumpButton = document.createElement('button');
    delButton.type = 'button';
    editButton.type = 'button';
    bumpButton.type = 'button';
    delButton.className = 'delLotButton emDel';
    editButton.className = 'editLotButton';
    bumpButton.className = 'bumpLotButton';
    if (premiumOps <= 0) {
      bumpButton.className += ' limitReached';
      bumpButton.title = 'Достигнут лимит поднятий (0 из 5 осталось)';
    }
    bumpButton.innerHTML = '🚀';
    $(delButton).on('click', () => this_.deleteLot(item.id.toString(), item.volume.uom, item.volume.value));
    $(editButton).on('click', () => this_.preEditLot(item.id.toString()));
    $(bumpButton).on('click', () => this_.preBumpLot(item, bumpButton));

    lot.innerHTML = html;
    lot.className = 'activeLot' + (isNew ? ' newly-added' : '');
    lot.dataset.lotid = item.id.toString();
    lot.dataset.lotuom = item.volume.uom;
    lot.dataset.lotvolume = item.volume.value;
    lot.dataset.lotprice = item.cost.amount;
    lot.dataset.lotemojis = emojisStr;
    lot.dataset.lotsellername = (item.seller.name == null || item.seller.name.length == 0 ? '' : true );
    lot.dataset.lotpremiumops = premiumOps.toString();
    
    if(edit) {
      $('*[data-lotid="' + item.id.toString() + '"]').after(lot);
      $($('*[data-lotid="' + item.id.toString() + '"]')[0]).remove();
    } else {
      $('.lotsWrapper').append(lot);
    }
    $(lot).append(bumpButton);
    $(lot).append(editButton);
    $(lot).append(delButton);
    
    if (isNew) {
      setTimeout(() => {
        $(lot).removeClass('newly-added');
      }, 500);
    }
    
    setTimeout(() => this_.checkLotPosition(item.id), 2000);
  }
  deleteLotFromList (id) {
    let lotEl = $('*[data-lotid="' + id + '"]');
    lotEl.addClass('removing');
    setTimeout(() => {
      lotEl.remove();
    }, 300);
    clearTimeout(this.positionTimeouts[id]);
  }
  
  setLotBought (lotID) {
    let this_ = this;
    clearTimeout(this_.positionTimeouts[lotID]);
    let lotEl = $('*[data-lotid="' + lotID + '"]');
    lotEl.addClass('soldLot');
    

    if (lotEl.find('.soldLabel').length === 0) {
      lotEl.append('<span class="soldLabel">ЛОТ ПРОДАН</span>');
    }
    

    let log = readFromStorage('t2_trade_log') || [];
    let loggedItem = log.find(x => x.id === lotID);
    if (loggedItem && loggedItem.soldDate) {
      let soldTime = timeConverter(loggedItem.soldDate);
      lotEl.find('.lotDateText').html('Продан: ' + soldTime).addClass('soldTimeText');
    }
    

    lotEl.find('.lotEmojisContainer').remove();
    lotEl.find('.bumpLotButton').remove();
    lotEl.find('.editLotButton').remove();
    lotEl.find('.delLotButton').remove();
    lotEl.find('.lotPosition').remove();
    lotEl.find('.lotMetaRightCol').remove();
  }
  
  preEditLot (lotID) {
    let that = this;

    let tmpVolume = $('.lotVolume').val();
    let tmpUom = $('.lotUom').val();
    let tmpPrice = $('.lotPrice').val();
    let tmpChkbx = $('.nameCheckbox').prop('checked');
    let tmpEmojis = emojisGlobal;
    
    let el = $('*[data-lotid="' + lotID + '"]');
    
    
    $('.lotUom').val(el.attr('data-lotuom'));
    $('.lotUom').change();
    $('.lotVolume').val(el.attr('data-lotvolume'));
    $('.lotPrice').val(el.attr('data-lotprice'));
    $('.nameCheckbox').prop('checked', el.attr('data-lotsellername') === 'true');
    that.selectEm('del');
    el.attr('data-lotemojis').split(' ').slice(1).forEach((it) => {
      that.selectEm(it);
    });
      
    $('.lotVolume').attr('disabled', true);
    $('.lotUom').attr('disabled', true);
    
    $('.buttonsWrapper').children().css('display','none');
    $('.activeLot').addClass('visibilityHidden');
    $('*[data-lotid="' + lotID + '"]').removeClass('visibilityHidden');
    $('*[data-lotid="' + lotID + '"]').find('button').addClass('displayNone');
    
    
    let buttonCancel = document.createElement('button');
    buttonCancel.innerHTML = 'Отменить';
    buttonCancel.type = 'button';
    buttonCancel.className = 'btn btn-black myBtn btn-secondary-action';

    let buttonEdit = document.createElement('button');
    buttonEdit.innerHTML = 'Изменить';
    buttonEdit.type = 'button';
    buttonEdit.className = 'btn btn-black myBtn btn-primary-action';

    $('.buttonsWrapper').append(buttonCancel);
    $('.buttonsWrapper').append(buttonEdit);
    
    function cancel () {
      $('.lotUom').val(tmpUom);
      $('.lotUom').change();
      $('.lotVolume').val(tmpVolume);
      $('.lotPrice').val(tmpPrice);
      $('.nameCheckbox').prop('checked', tmpChkbx);

      that.selectEm('del');
      tmpEmojis.forEach((it) => {
        that.selectEm(it);
      });
      
      $('.lotVolume').attr('disabled', false);
      $('.lotUom').attr('disabled', false);
    
      $(buttonCancel).remove();
      $(buttonEdit).remove();
      $('.buttonsWrapper').children().css('display','inline-block');
      $('.activeLot').removeClass('visibilityHidden');
      $('*[data-lotid="' + lotID + '"]').find('button').removeClass('displayNone');      
    }
    
    $(buttonCancel).on('click', () => {
      cancel();
    });
    $(buttonEdit).on('click', () => {
      let price = parseInt( $('.lotPrice').val() );
      let sellerName = ($('.nameCheckbox')[0].checked ? true : false);
      that.editLot ({id:lotID}, price, sellerName, emojisGlobal, true);
      cancel();
    });
  }
  
  getLots () {
    let this_ = this;
    let aT = this_.getAccessToken();
    this_.msgBox('');
    this_.saveFields();
    $('.noActiveLotsMsg').remove();
    $.ajax({
        url: this_.baseUrl,
        timeout: 40000,
        dataType: 'json',
        method: 'GET',
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + aT,
          'X-Request-Id': generateRandomString(40)
        },
        beforeSend: function (data) {
          this_.setBusy(true);
        },
        success: function (data_f) {
          if (data_f.meta.status == 'OK') {
            let tmpLotsArray = [];
            for(let i = 0; i < $('.activeLot').length; i++) {
              tmpLotsArray.push($($('.activeLot')[i]).attr('data-lotid'));
            }            
            
            $('.lotsWrapper').html('');
            let lots = [];

            data_f.data.forEach((it) => {
              if(Date.now() - (new Date(it.creationDate).getTime()) < this_.monthInMs) {
                if(it.status == 'active') {
                  if (this_.activeTab === 'active' || this_.activeTab === 'all') {
                    lots.push(it);
                  }
                } else
                if(it.status == "bought") {

                  this_.addToTradeLog(it);
                  
                  if (this_.activeTab === 'bought' || this_.activeTab === 'all') {
                    lots.push(it);
                  }
                }
              }
            });
            lots.sort((a,b) => (a.creationDate > b.creationDate) ? 1 : ((b.creationDate > a.creationDate) ? -1 : 0));
            lots.forEach((it) => {
              this_.addLotToList(it);
              if(it.status == "bought") {
                this_.setLotBought(it.id);
              }
            });
            if(lots.length == 0) {
              let msg = 'Нет активных лотов';
              if (this_.activeTab === 'bought') msg = 'Нет проданных лотов';
              if (this_.activeTab === 'all') msg = 'Нет созданных лотов';
              $('.lotsWrapper').html('<span class="noActiveLotsMsg">' + msg + '</span>');
            }
            
          } else {
            this_.msgBox('[' + data_f.meta.status + ']: ' + data_f.meta.message);
          }
        },
        error: function (data_e) {
          if(data_e.responseJSON) {
            this_.msgBox('Ошибка получения списка лотов: [' + data_e.responseJSON.meta.status + ']: ' + data_e.responseJSON.meta.message);
            if(data_e.responseJSON.meta.message == "Authorization failed") {
              document.location.reload();
            }
          } else {
            this_.msgBox('Ошибка получения списка лотов');
          }
        },
        complete: function () {
          this_.setBusy(false);
        },
    });
    
  }
  checkLotPosition(lotId) {
    let this_ = this;
    clearTimeout(this_.positionTimeouts[lotId]);
    
    let lot = $('*[data-lotid="' + lotId + '"]');
    if(lot.length == 0) return false;
    
    let lotVolume = parseInt(lot.attr('data-lotvolume'));
    let lotPrice = parseInt(lot.attr('data-lotprice'));
    let trType = {'gb':'data','min':'voice','sms':'sms'};
    let lotTrafficType = trType[lot.attr('data-lotuom')];
    
    let positionDiv = $(lot).find('.lotPositionBadge');
    positionDiv.addClass('lotPositionAnimation');
    
    $.ajax({
      url: 'https://' +document.location.host+'/api/exchange/lots?trafficType='+lotTrafficType+'&volume='+lotVolume+'&cost='+lotPrice+'&offset=0&limit=100',
      timeout: 40000,
      dataType: 'json',
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'X-Request-Id': generateRandomString(40)
      },
      success: function (data_f) {
        if (data_f.meta.status == "OK") {
          let position = 0;
          let arr = data_f.data;
          for(let i = 0; i < arr.length; i++) {
            if (arr[i].id == lotId) {
              position = i+1;
              break;
            }
          }
          if(position == 0) {
            positionDiv.html('∞').addClass('is-infinite');
            this_.checkIfLotBought(lotId);
          } else {
            positionDiv.html(position).removeClass('is-infinite');
          }
        }
      },
      error: function (data_e) {
        if(data_e.responseJSON) {
          this_.msgBox('Ошибка получения позиции лота '+lotId+': [' + data_e.responseJSON.meta.status + ']: ' + data_e.responseJSON.meta.message);
        }
      },
      complete: function (data_f) {
        positionDiv.removeClass('lotPositionAnimation');
        
        
        this_.positionTimeouts[lotId] = setTimeout(() => {
          this_.checkLotPosition(lotId);
        }, 12000 + Math.round(Math.random() * 6000 - 3000));
      }
    });
  }

  checkIfLotBought (lotId) {
    let this_ = this;
    let aT = this_.getAccessToken();
    if (!aT) return;
    $.ajax({
        url: this_.baseUrl,
        timeout: 20000,
        dataType: 'json',
        method: 'GET',
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + aT,
          'X-Request-Id': generateRandomString(40)
        },
        success: function (data_f) {
          if (data_f.meta.status == 'OK') {
            let lot = data_f.data.find(x => x.id.toString() === lotId.toString());
            if (lot && lot.status === 'bought') {
              this_.addToTradeLog(lot);
              this_.setLotBought(lotId);
              
              if (this_.activeTab === 'active') {
                let lotEl = $('*[data-lotid="' + lotId + '"]');
                lotEl.fadeOut(300, function() {
                  $(this).remove();
                });
              }
            }
          }
        }
    });
  }
  
  updateRestsBlock () {
    let minHtml = '<span class="restChip chipMin"><span class="chipIcon">📞</span> ' + this.rests.min + ' мин</span>';
    let gbHtml = '<span class="restChip chipGb"><span class="chipIcon">🌐</span> ' + this.rests.gb + ' ГБ</span>';
    let smsHtml = '<span class="restChip chipSms"><span class="chipIcon">💬</span> ' + this.rests.sms + ' SMS</span>';
    $('.restsBlock').html(minHtml + gbHtml + smsHtml);
  }
  
  getRests () {
    let this_ = this;
    let aT = this_.getAccessToken();
    this_.msgBox('');

    this.rests = {'gb':0,'min':0,'sms':0};
    $.ajax({
        url: 'https://'+document.location.host+'/api/subscribers/'+this_.phoneNum+'/rests?includePackageDescription=true',
        timeout: 40000,
        dataType: 'json',
        method: 'GET',
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + aT,
          'X-Request-Id': generateRandomString(40)
        },
        beforeSend: function (data) {
          this_.setBusy(true);
        },
        success: function (data_f) {
          if (data_f.meta.status == 'OK') {
            data_f.data.rests.forEach ((it) => {
              if (it.type == 'tariff' && !it.rollover) {
                if(it.uom == 'min')
                    this_.rests.min += it.remain;
                if(it.uom == 'mb')
                    this_.rests.gb += it.remain;
                if(it.uom == 'pcs')
                    this_.rests.sms += it.remain;
              }
            });
            this_.rests.gb = Math.floor(this_.rests.gb / 1024);
            this_.updateRestsBlock();

          } else {
            this_.msgBox('[' + data_f.meta.status + ']: ' + data_f.meta.message);
          }
        },
        error: function (data_e) {
          if(data_e.responseJSON) {
            this_.msgBox('Ошибка получения остатков трафика [' + data_e.responseJSON.meta.status + ']: ' + data_e.responseJSON.meta.message);
          } else {
            this_.msgBox('Ошибка получения остатков трафика');
          }          
        },
        complete: function () {
          this_.setBusy(false);
        },
    });
    
  }
  
  
  addLot () {
    let this_ = this;
    let aT = this_.getAccessToken();
    let lotVolume = parseInt( $('.lotVolume').val() );
    let lotPrice = parseInt( $('.lotPrice').val() );
    let lotUom = $('.lotUom').val();
    let trType = {'gb':'data','min':'voice','sms':'sms'};
    let lotTrafficType = trType[lotUom];
    let sellerName = $('.nameCheckbox').prop('checked');
    let ems = emojisGlobal;
    
    
    this_.saveFields();
    this_.msgBox('');
    
    $.ajax({
        url: this_.baseUrl,
        timeout: 40000,
        dataType: 'json',
        method: 'PUT',
        data: JSON.stringify({
            volume: {'value':lotVolume,'uom':lotUom},
            cost: {'amount':lotPrice,'currency':'rub'},
            trafficType: lotTrafficType
        }),
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + aT,
          'X-Request-Id': generateRandomString(40)
        },
        beforeSend: function (data) {
          this_.setBusy(true);
        },
        success: function (data_f) {
          if (data_f.meta.status == 'OK') {
            this_.editLot(data_f.data, lotPrice, sellerName, ems);
            this_.rests[lotUom] -= lotVolume;
            this_.updateRestsBlock();
            $('.noActiveLotsMsg').remove();
          } else {
            this_.msgBox('[' + data_f.meta.status + ']: ' + data_f.meta.message);
          }
        },
        error: function (data_e) {
          if(data_e.responseJSON) {
            this_.msgBox('Ошибка создания лота [' + data_e.responseJSON.meta.status + ']: ' + data_e.responseJSON.meta.message);
          } else {
            this_.msgBox('Ошибка создания лота');
          }
        },
        complete: function () {
          this_.setBusy(false);
        },
    });
  }

  editLot (lot, price, sellerName, emojis, manual) {
    let this_ = this;
    let aT = this_.getAccessToken();
    let data_json = JSON.stringify({'showSellerName':sellerName,'emojis':emojis,'cost':{'amount':price,'currency':'rub'}});
    this_.msgBox('');
    
    $.ajax({
        url: this_.baseUrl+'/'+lot.id,
        timeout: 40000,
        dataType: 'json',
        method: 'PATCH',
        data: data_json,
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + aT,
          'X-Request-Id': generateRandomString(40)
        },
        beforeSend: function (data) {
          this_.setBusy(true);
        },
        success: function (data_f) {
          if (data_f.meta.status == 'OK') {
            if(!manual) {
              this_.addLotToList(data_f.data, false, true);
            } else {
              this_.addLotToList(data_f.data, true);              
              setTimeout(() => this_.getLots(), 500);
            }
          } else {
            if(!manual) {
              this_.addLotToList(lot);
              this_.msgBox('[' + data_f.meta.status + ']: ' + data_f.meta.message);
            }
          }
        },
        error: function (data_e) {
          if(data_e.responseJSON) {
            this_.msgBox('Ошибка изменения лота [' + data_e.responseJSON.meta.status + ']: ' + data_e.responseJSON.meta.message);
          } else {
            this_.msgBox('Ошибка изменения лота');
          }
        },
        complete: function () {
          this_.setBusy(false);
        },
    });
  }
  
  deleteAllLots () {
    if(window.confirm('Отозвать все лоты?')) {
      let this_ = this;
      $('.activeLot').each((i, it) => {
          setTimeout(() => this_.deleteLot($(it).attr('data-lotid'), $(it).attr('data-lotuom'), $(it).attr('data-lotvolume')), i*1000);
      });
    }
  }
  
  deleteLot (lotId, uom, volume) {
    let this_ = this;
    let aT = this_.getAccessToken();
    this_.msgBox('');
    $.ajax({
        url: this_.baseUrl+'/'+lotId,
        timeout: 40000,
        dataType: 'json',
        method: 'DELETE',
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + aT,
          'X-Request-Id': generateRandomString(40)
        },
        beforeSend: function (data) {
          this_.setBusy(true);
        },
        success: function (data_f) {
          if (data_f.meta.status == 'OK') {
            this_.deleteLotFromList(lotId);

            this_.updateRestsBlock();
          } else {
            this_.msgBox('[' + data_f.meta.status + ']: ' + data_f.meta.message);
          }
        },
        error: function (data_e) {
          if(data_e.responseJSON) {
            if(data_e.responseJSON.meta.status == 'bp_err_StatusBought') {
              this_.setLotBought(lotId);
              let el = $('*[data-lotid="' + lotId + '"]');
              let volume = parseInt(el.attr('data-lotvolume')) || 0;
              let uom = el.attr('data-lotuom') || '';
              let price = parseInt(el.attr('data-lotprice')) || 0;
              this_.addToTradeLog({
                id: lotId,
                volume: { value: volume, uom: uom },
                cost: { amount: price }
              });
            } else {
              this_.msgBox('Ошибка удаления лота [' + data_e.responseJSON.meta.status + ']: ' + data_e.responseJSON.meta.message);
            }
          } else {
            this_.msgBox('Ошибка удаления лота');
          }
        },
        complete: function () {
          this_.setBusy(false);
        },
    });
  }
  
  preBumpLot (item, button) {
    let this_ = this;
    let lotEl = $(button).closest('.activeLot');
    let premiumOps = parseInt(lotEl.attr('data-lotpremiumops'));
    if (isNaN(premiumOps)) premiumOps = 5;
    
    if (premiumOps <= 0) {
      this_.msgBox('Не получится поднять этот лот. Вы подняли этот лот 5 раз – это максимум.', 'red');
      return;
    }
    
    if (this_.sets.autoConfirmPremium) {
      this_.bumpLot(item.id.toString(), button);
    } else {
      if (window.confirm("Поднять лот в топ за 5 рублей?")) {
        this_.bumpLot(item.id.toString(), button);
      }
    }
  }

  bumpLot (lotId, button) {
    let this_ = this;
    let aT = this_.getAccessToken();
    this_.msgBox('');
    $.ajax({
        url: 'https://' + document.location.host + '/api/subscribers/' + this_.phoneNum + '/exchange/lots/premium',
        timeout: 40000,
        dataType: 'json',
        method: 'PUT',
        data: JSON.stringify({
            lotId: lotId
        }),
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + aT,
          'X-Request-Id': generateRandomString(40)
        },
        beforeSend: function (data) {
          this_.setBusy(true);
        },
        success: function (data_f) {
          if (data_f.meta.status == 'OK') {
            this_.msgBox('Лот успешно поднят в топ!', 'green');
            this_.addExpenseToTradeLog(5);
            

            let lotEl = $(button).closest('.activeLot');
            if (lotEl.length > 0) {
              let currentOps = parseInt(lotEl.attr('data-lotpremiumops'));
              if (isNaN(currentOps)) currentOps = 5;
              let newOps = Math.max(0, currentOps - 1);
              lotEl.attr('data-lotpremiumops', newOps);
              
              let badge = lotEl.find('.lotPremiumOpsBadge');
              badge.html('🚀 ' + newOps);
              if (newOps <= 0) {
                let btn = lotEl.find('.bumpLotButton');
                btn.addClass('limitReached');
                btn.attr('title', 'Достигнут лимит поднятий (0 из 5 осталось)');
              }
            }
          } else {
            let status = data_f.meta.status;
            let message = data_f.meta.message || '';
            if (status === 'NOT_ENOUGH_LIMIT' || message.indexOf('not enough ops') !== -1) {
              this_.msgBox('Недостаточно лимитов для поднятия лота (исчерпан лимит на аккаунте)', 'red');
            } else {
              this_.msgBox('Ошибка поднятия лота: [' + status + ']: ' + message);
            }
          }
        },
        error: function (data_e) {
          if(data_e.responseJSON) {
            let status = data_e.responseJSON.meta.status;
            let message = data_e.responseJSON.meta.message || '';
            if (status === 'NOT_ENOUGH_LIMIT' || message.indexOf('not enough ops') !== -1) {
              this_.msgBox('Недостаточно лимитов для поднятия лота (исчерпан лимит на аккаунте)', 'red');
            } else {
              this_.msgBox('Ошибка поднятия лота: [' + status + ']: ' + message);
            }
          } else {
            this_.msgBox('Ошибка поднятия лота');
          }
        },
        complete: function () {
          this_.setBusy(false);
        },
    });
  }
  
  addToTradeLog (item) {
    let log = readFromStorage('t2_trade_log') || [];
    if (log.some(x => x.id === item.id)) return;
    
    log.push({
      id: item.id,
      volume: item.volume.value,
      uom: item.volume.uom,
      cost: item.cost.amount,
      soldDate: Date.now()
    });
    writeToStorage('t2_trade_log', log);
    this.updateTradeLogUI();
  }

  addExpenseToTradeLog (amount) {
    let log = readFromStorage('t2_trade_log') || [];
    log.push({
      id: 'expense-' + Date.now(),
      volume: 0,
      uom: 'expense',
      cost: -amount,
      soldDate: Date.now()
    });
    writeToStorage('t2_trade_log', log);
    this.updateTradeLogUI();
  }

  updateTradeLogUI () {
    let log = readFromStorage('t2_trade_log') || [];
    let now = Date.now();
    let oneDayMs = 24 * 60 * 60 * 1000;
    
    let earnedToday = 0;
    let earnedAllTime = 0;
    
    log.forEach(item => {
      let diff = now - item.soldDate;
      if (diff < oneDayMs) {
        earnedToday += item.cost;
      }
      earnedAllTime += item.cost;
    });
    
    $('.statsToday').text(earnedToday + ' ₽');
    $('.statsAllTime').text(earnedAllTime + ' ₽');
  }

  setBusy (isBusy) {
    if (isBusy) {
      this.busyCount++;
    } else {
      this.busyCount = Math.max(0, this.busyCount - 1);
    }
    
    if (this.busyCount > 0) {
      $('.headerLoader').addClass('active');
      $('.t2marketbot_tk').addClass('is-loading');
      $('.lotsWrapper').addClass('loading');
    } else {
      $('.headerLoader').removeClass('active');
      $('.t2marketbot_tk').removeClass('is-loading');
      $('.lotsWrapper').removeClass('loading');
    }
  }
  
  setMinCost () {
    let uom = $('.lotUom').val();
    let volInput = $('.lotVolume');
    let priceInput = $('.lotPrice');
    let volume = parseInt(volInput.val()) || 0;
    
    // Enforce minimum volume based on category
    if (uom === 'gb') {
      if (volume < 1) {
        volume = 1;
        volInput.val(volume);
      }
    } else if (uom === 'min') {
      if (volume < 50) {
        volume = 50;
        volInput.val(volume);
      }
    } else if (uom === 'sms') {
      if (volume < 50) {
        volume = 50;
        volInput.val(volume);
      }
    }
    
    // Enforce minimum price based on category
    let minPrice = 0;
    if (uom === 'gb') {
      minPrice = volume * 15;
    } else if (uom === 'min') {
      minPrice = Math.max(40, Math.ceil(volume * 0.8));
    } else if (uom === 'sms') {
      minPrice = Math.max(25, Math.ceil(volume * 0.5));
    }
    
    priceInput.val(minPrice);
  }
  
  changeLotsWrapperHeight() {
    let h = $(window).height() - $('.elementsWrapper').height() - $('.appWindowsHeader').outerHeight() - $('.lotsTabHeader').outerHeight();
    if (h < 0) h = 0;
    $('.lotsWrapper').css('max-height', h + 'px');
  }
    
  hide () {

    $('.t2marketbot_tk').addClass('displayNone');
    $('.showBlockButton').removeClass('displayNone');
    writeToStorage('t2_isExpand', false);
  }
  
  expand () {

    $('.t2marketbot_tk').removeClass('displayNone');    
    $('.showBlockButton').addClass('displayNone');
    writeToStorage('t2_isExpand', true);
    this.changeLotsWrapperHeight();
  }

  close () {
    $('.t2marketbot_tk').remove();
    $('.showBlockButton').remove();
    if (this.msgBoxTimeout) {
      clearTimeout(this.msgBoxTimeout);
    }
    for (let key in this.positionTimeouts) {
      clearTimeout(this.positionTimeouts[key]);
    }
    t2marketbot = null;
  }
  


}

let t2marketbot;
setInterval( () => {
  if(document.location.href.indexOf('t2.ru/stock-exchange') == -1) {
    if(t2marketbot)
      t2marketbot.close();
  }
  else if(!($('.t2marketbot_tk').length)) {
    t2marketbot = new t2marketbot_tk();
  }
}, 1000);

let lastTokenRaw = null;
let lastDecodedJWT = null;
function JWT_to_JSON (token) {
  if (token === lastTokenRaw && lastDecodedJWT) {
    return lastDecodedJWT;
  }
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  lastTokenRaw = token;
  lastDecodedJWT = JSON.parse(jsonPayload);
  return lastDecodedJWT;
};

let global_tokensArray = readFromStorage('t2_tokens');
function getTokens() {
  if(global_tokensArray) {
    let aT = (document.cookie.match('(^|; )access_token=([^;]*)')||0)[2];
    if(aT && aT.length > 0) {
      let JWT = JWT_to_JSON(aT);
      let phone = JWT.current_username;
      if(t2marketbot && phone != t2marketbot.phoneNum) {
        if(phone != JWT.preferred_username) {
          global_tokensArray = global_tokensArray.filter(function (el) {return el.phone != JWT.preferred_username;});
          writeToStorage('t2_tokens', global_tokensArray);
        }
        if(t2marketbot.preferred_username == JWT.preferred_username) {
          global_tokensArray = global_tokensArray.filter(function (el) {return el.phone != t2marketbot.phoneNum;});
          writeToStorage('t2_tokens', global_tokensArray);
        }
        document.location.reload();
        return false;
      }
    
    
      let accIdx = global_tokensArray.findIndex(x => x.phone == phone);
      if(accIdx != -1) {
        if(aT != global_tokensArray[accIdx].aT) {
          global_tokensArray[accIdx].aT = aT;
          global_tokensArray[accIdx].rT = (document.cookie.match('(^|; )refresh_token=([^;]*)')||0)[2];
          writeToStorage('t2_tokens', global_tokensArray);
        }
      } else {
          global_tokensArray.push({
            phone: phone,
            aT: aT,
            rT: (document.cookie.match('(^|; )refresh_token=([^;]*)')||0)[2],
          });
          writeToStorage('t2_tokens', global_tokensArray);
      }
    }
  } else
    global_tokensArray = [];
}
let scanTokensInterval = setInterval(() => getTokens(), 1000);

function timeConverter(timestamp) {
    let a = new Date(timestamp);
    let months = [
        "янв",
        "фев",
        "мар",
        "апр",
        "май",
        "июн",
        "июл",
        "авг",
        "сен",
        "окт",
        "ноя",
        "дек",
    ];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = (a.getHours() < 10 ? "0" + a.getHours() : a.getHours());
    let min = (a.getMinutes() < 10 ? "0" + a.getMinutes() : a.getMinutes());
    let sec = (a.getSeconds() < 10 ? "0" + a.getSeconds() : a.getSeconds());
    let time = date + " " + month + " " + " " + hour + ":" + min + ":" + sec;
    return time;
}

function getRemainingTimeText(expirationDateStr) {
  let expireTime = Date.parse(expirationDateStr);
  if (isNaN(expireTime)) return '';
  let diffMs = expireTime - Date.now();
  if (diffMs <= 0) return 'Истёк';
  let diffMins = Math.floor(diffMs / 60000);
  let diffHours = Math.floor(diffMins / 60);
  let diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return 'Сгорит: ' + diffDays + 'д ' + (diffHours % 24) + 'ч';
  } else if (diffHours > 0) {
    return 'Сгорит: ' + diffHours + 'ч ' + (diffMins % 60) + 'м';
  } else {
    return 'Сгорит: ' + diffMins + 'м';
  }
}

function formatPhoneNumber(phoneNumberString) {
  let cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  let match = cleaned.match(/^(\d{1})?(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return ['+', match[1], ' (', match[2], ') ', match[3], '-', match[4], '-', match[5]].join('');
  }
  return phoneNumberString;
}

function readFromStorage (key) {
  return JSON.parse(localStorage.getItem(key));
}

function writeToStorage(key, o) {
  try {
    localStorage.setItem(key, JSON.stringify(o));
  } catch (e) {
    if (e == QUOTA_EXCEEDED_ERR) {
      alert('Превышен лимит в локальном хранилище');
    }
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function generateRandomString(length = 10) {
  let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let charactersLength = characters.length;
  let randomString = '';
  for (let i = 0; i < length; i++) {
      randomString += characters[getRandomInt(charactersLength - 1)];
  }
  return randomString;
}

function write_cookie2(name, value) {
  let exdate = new Date();
  exdate.setMonth(exdate.getMonth() + 12);
  document.cookie = [name, '=', escape((value)), '; domain=.t2.ru; path=/', '; expires='+exdate.toUTCString()+';'].join('');
}

function deleteAllCookies() {
  document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
}
