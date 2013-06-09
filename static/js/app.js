var Session = Backbone.Model.extend({});

var Topic = Backbone.Model.extend({});

var Sessions = Backbone.Collection.extend({
  model: Session,
  url: 'sessions'
});

var Topics = Backbone.Collection.extend({
  model: Topic,

  url: function() {
    return 'sessions/' + this.id + '/topics';
  },

  setId: function(id) {
    this.id = id;
  },

  update: function(id) {
    var self = this;
    this.id = id;
    this.fetch({success: function() {
      self.trigger('batchUpdate', self);
    }}
    );
  },

  initialize: function(id) {
    this.setId(id);
  }

});

var sessions = new Sessions();
var topics = new Topics();

var SessionView = Backbone.View.extend({
  tagName: 'li',

  template: _.template('<%= legislature %> – <%= session %>'),

  events: {
    'click': 'selectSession'
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },

  selectSession: function() {
    var id = this.model.get('id');
    $('#session-menu li').removeClass('selected');
    this.$el.addClass('selected');

    topics.update(id);
  }

});

var SessionMenuView = Backbone.View.extend({
  el: '#session-menu',

  initialize: function() {
    this.listenTo(sessions, 'add', this.addToMenu);
    if(sessions_bootstrap) {
      sessions.set(sessions_bootstrap);
    } else {
      sessions.fetch();
    }
  },

  addToMenu: function(session) {
    var view = new SessionView({model: session});
    this.$el.append(view.render().el);
  }

});

var TopicView = Backbone.View.extend({
  tagName: 'li',

  template: _.template('<%= call_text %>'),

  initialize: function() {
    this.listenTo(topics, 'remove', this.removedFromList);
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },

  removedFromList: function() {
    this.remove();
  }

});

var TopicListView = Backbone.View.extend({
  el: '#topic-list',

  initialize: function() {
    this.listenTo(topics, 'batchUpdate', this.addAllToList);
  },

  addToList: function(topic) {
    var view = new TopicView({model: topic});
    this.$el.append(view.render().el);
  },

  addAllToList: function(coll) {
    var payload = [];
    coll.each(function(c) {
      var view = new TopicView({model: c});
      payload.push(view.render().el);
    });

    this.$el.html(payload);
  }

});

new SessionMenuView();
new TopicListView();
