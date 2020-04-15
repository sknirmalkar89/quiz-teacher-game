/**
 * Plugin to event handler
 * @extends base Plugin
 * @author Jagadish P <jagadish.pujari@tarento.com>
 */

 /* istanbul ignore next */
 Plugin.extend({
  _type: 'org.ekstep.navigation',
  _render: true, 
  _qsSummary: {},
  customNavigationVisible: false, 
  _config:{},
  _templatePath: undefined,
  _customNavigationPlugins:[],
  initialize: function() {
    _.forEach(Renderer.theme._data.stage, function(stage, key){
        var obj = {};
        obj.id = stage.id;
        obj.data = stage;
        if (key === 0 || key === 1 || key === 2 || key === 3) obj.level = 1
        if (key === 4 || key === 5 || key === 6 || key === 7) obj.level = 2
        if (key === 8 || key === 9 || key === 10 || key === 11) obj.level = 3
        if (key === 12 || key === 13 || key === 14 || key === 15) obj.level = 4
        obj.attempted = false;
        obj.score = 0;
        window.adaptiveQuestions.push(obj);
    })
    var instance = this;
    instance._qsSummary = {"attempted":[],"nonAttempted":[]};
    this._templatePath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/navigation.html");
    this.controllerPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/controller/navigation_ctrl.js");
    org.ekstep.service.controller.loadNgModules(this._templatePath, this.controllerPath);

    EkstepRendererAPI.addEventListener("renderer:overlay:show", instance.showOrHideOverlay, instance);        
    EkstepRendererAPI.addEventListener("renderer:content:start", instance.showOrHideOverlay, instance);
    //Register plugin for custom navigation
    EkstepRendererAPI.addEventListener("renderer:navigation:register",function(event, data){
      instance._customNavigationPlugins.push(event.target);
    });

    //Register plugin for custom navigation
    EkstepRendererAPI.addEventListener("renderer:navigation:deregister",function(event){
      var index = _.findIndex(instance._customNavigationPlugins, function(pluginInstance){ return pluginInstance.id == event.target.id});
      if (index > -1) {
        instance._customNavigationPlugins.splice(index, 1);
      }
      //Get score and decide with slide has to load
      instance._assessEvents = org.ekstep.service.content.getTelemetryEvents();
      var earnedScore = 0,totalScore = 0;
      _.forEach(instance._assessEvents.assess,function(val,key){
          if (val.edata.stageId === Renderer.theme._currentScene.id){
            earnedScore = earnedScore + val.edata.score;
            totalScore = totalScore + val.edata.item.maxscore;
          }
      });
      var perc = (100 * earnedScore) / totalScore;
      window.adaptiveQuestion.earnedScore = earnedScore; 
      window.adaptiveQuestion.totalScore = totalScore; 
      //instance.calculateScore();
      var stageIndex = 0;
      _.forEach(Renderer.theme._data.stage,function(val,key){
          if (val.id == Renderer.theme._currentScene.id){
            stageIndex = key
          }
      });

      

      //window.adaptiveQuestion.visitedStages.push({"stageId": Renderer.theme._currentScene.id, "score": perc, "index": stageIndex})
    
      if(perc < 50){
        window.adaptiveQuestions[stageIndex].attempted = true;
        window.adaptiveQuestions[stageIndex].score = perc;
        if (stageIndex == 1 || stageIndex == 4 || stageIndex == 8 || stageIndex == 12){
          //showToaster('error', "You are failed in exam, Please replay the content to re-exam");
          EkstepRendererAPI.showEndPage()
        }else{
          var stage = Renderer.theme._data.stage[stageIndex - 3] && Renderer.theme._data.stage[stageIndex - 3].id;
          var showEndpage = window.adaptiveQuestions[(stageIndex - 3)+ 1] && window.adaptiveQuestions[(stageIndex - 3)+ 1].attempted;

          if (stage && !showEndpage){
            //showToaster('error', "You are failed in exam, you need to complete stage " + (stageIndex));
            EkstepRendererAPI.tansitionTo(Renderer.theme._data.stage[stageIndex - 3].id)
          }else{
            //showToaster('error', "You are failed in exam, Please replay the content to re-exam");
            EkstepRendererAPI.showEndPage()
          }
        }

        
      }else if(perc > 50 && perc < 90){
        window.adaptiveQuestions[stageIndex].attempted = true;
        window.adaptiveQuestions[stageIndex].score = perc;
        var stage = Renderer.theme._data.stage[stageIndex + 3] && Renderer.theme._data.stage[stageIndex + 3].id;
        var showEndpage = window.adaptiveQuestions[stageIndex + 3] && window.adaptiveQuestions[stageIndex + 3].attempted;

        if(stageIndex == 5 || stageIndex == 11 || stageIndex == 17){
          var stage = Renderer.theme._data.stage[stageIndex + 1] && Renderer.theme._data.stage[stageIndex + 1].id;
          var showEndpage = window.adaptiveQuestions[stageIndex + 1] && window.adaptiveQuestions[stageIndex + 1].attempted;
          if (stage && !showEndpage){
            //showToaster('info', "Congratulation you skiped one stage, now you are in stage " + (stageIndex+1));
            EkstepRendererAPI.tansitionTo(Renderer.theme._data.stage[stageIndex + 1].id)
          }else{
            EkstepRendererAPI.showEndPage()
          }
        }else{
          if (stage && !showEndpage){
            //showToaster('info', "Congratulation, now you are in stage " + (stageIndex +2));
            EkstepRendererAPI.tansitionTo(Renderer.theme._data.stage[stageIndex + 3].id)
          }else{
            EkstepRendererAPI.showEndPage()
          }
        }

        
      }else if(perc > 90){
        window.adaptiveQuestions[stageIndex].attempted = true;
        window.adaptiveQuestions[stageIndex].score = perc;
        if(stageIndex == 5 || stageIndex == 11 || stageIndex == 17){
          var stage = Renderer.theme._data.stage[stageIndex + 1] && Renderer.theme._data.stage[stageIndex + 1].id;
          var showEndpage = window.adaptiveQuestions[stageIndex + 1] && window.adaptiveQuestions[stageIndex + 1].attempted;
          if (stage && !showEndpage){
            //showToaster('info', "Congratulation you skiped one stage, now you are in stage " + (stageIndex+1));
            EkstepRendererAPI.tansitionTo(Renderer.theme._data.stage[stageIndex + 1].id)
          }else{
            EkstepRendererAPI.showEndPage()
          }
        }else{
          var stage = Renderer.theme._data.stage[stageIndex + 3] && Renderer.theme._data.stage[stageIndex + 3].id;
          var showEndpage = window.adaptiveQuestions[stageIndex + 3] && window.adaptiveQuestions[stageIndex + 3].attempted;
          if (stage && !showEndpage){
            //showToaster('info', "Congratulation, now you are in stage " + (stageIndex+2));
            EkstepRendererAPI.tansitionTo(Renderer.theme._data.stage[stageIndex + 3].id)
          }else{
            EkstepRendererAPI.showEndPage()
          }
        }
      }
    });

    //If register call plugin next method
    EkstepRendererAPI.addEventListener("renderer:navigation:next",function(event){
      var registered = _.isEmpty(instance._customNavigationPlugins);
      if(!registered){
        // Get the first plugin instance and pass control to it.
        var pluginInstance = instance._customNavigationPlugins[0];
        pluginInstance.handleNext();

        if(pluginInstance._itemIndex > 0){
            EventBus.dispatch("renderer:previous:enable");
        }
      } else {
        EventBus.dispatch("actionNavigateNext", "next");
        EventBus.dispatch("nextClick");
      }
    });

    //If register call plugin previous method
    EkstepRendererAPI.addEventListener("renderer:navigation:prev",function(event){
      var registered = _.isEmpty(instance._customNavigationPlugins);
      var pluginInstance = instance._customNavigationPlugins[0];
        if(!registered){
          pluginInstance.handlePrevious();
          if(pluginInstance._itemIndex <= 0){
            EventBus.dispatch("renderer:previous:disable");
          }
        
          }else {
          EventBus.dispatch("actionNavigatePrevious", "previous");
          EventBus.dispatch("previousClick");
        }
      setTimeout(function(){ 
        var pluginInstance = instance._customNavigationPlugins[0];
        if(pluginInstance._itemIndex > 0){
            EventBus.dispatch("renderer:previous:enable");
          }
      }, 500);
    });

  },
  initPlugin: function (data) {
      // Plugin actions are handled in the angularJS controller.
  },
  showOrHideOverlay: function(){
    this.customNavigationVisible = true;
  },
  calculateScore: function(){
    var instance = this;
    var assessTelemetryData = org.ekstep.service.content.getTelemetryEvents();
    _.forEach(assessTelemetryData.assess, function(value,key) {
      var item = value.edata.item;
      switch(item.type){
        case 'ftb': if(_.isEmpty(value.edata.resvalues)){
                      instance.setNonAttemptedQuestion(key);                        
                    }else{
                      instance.setAttemptedQuestion(key);
                    }
                    break;
        case 'mcq': if(_.isEmpty(value.edata.resvalues[0])){
                      instance.setNonAttemptedQuestion(key);
                    }else{
                      instance.setAttemptedQuestion(key);
                    }
                    break;
        case 'reorder': if(_.isEmpty(value.edata.resvalues)){
                      instance.setNonAttemptedQuestion(key);
                    }else{
                      instance.setAttemptedQuestion(key);
                    }
                    break;
        case 'mtf': if(_.isEqual(item.params[1], value.edata.resvalues[1])){
                      instance.setNonAttemptedQuestion(key);                        
                    }else{
                      instance.setAttemptedQuestion(key);
                    }
                    break;
        case 'sequence': item.params.pop(); 
                      if(_.isEqual(item.params, value.edata.resvalues)){
                        instance.setNonAttemptedQuestion(key);                        
                      }else{
                        instance.setAttemptedQuestion(key);
                      }
                      break;
      }
    });
    console.log("calculateQuestion", instance._qsSummary)
  },
  setAttemptedQuestion: function(questionId){
    var instance = this;
    if(!_.includes(instance._qsSummary.attempted, questionId))
      instance._qsSummary.attempted.push(questionId);
      var index = instance._qsSummary.nonAttempted.indexOf(questionId);
      if (index !== -1) instance._qsSummary.nonAttempted.splice(index, 1);
  },
  setNonAttemptedQuestion: function(questionId){
    var instance = this;
    if(!_.includes(instance._qsSummary.nonAttempted, questionId))
      instance._qsSummary.nonAttempted.push(questionId);
      var index = instance._qsSummary.attempted.indexOf(questionId);
      if (index !== -1) instance._qsSummary.attempted.splice(index, 1);
  },
  
});
//# sourceURL=navigation.js
