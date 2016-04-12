function DependentArray() {
  this.q = {};
  this.d = {};
  this.u = {};
}

DependentArray.prototype.dormant = function (value, deps, name) {
  var type = 'd';
  var chil = [];
  var i;

  if (typeof deps === 'undefined') {
    deps = [];
  }

  if (typeof deps === 'string') {
    deps = [deps];
  }

  if (typeof name === 'undefined') {
    if (typeof value === 'string') {
      name = value.split('/').pop();
      name = name.substring(0, name.indexOf('.'));
    } else {
      throw new Error("When value isn't a string, name is required");
    }
  }

  if (name in this.u) {
    for (i = 0; i < this.u[name].length; i++) {
      if (this.u[name][i] in this.q) {
        type = 'q';
      }
    }
    chil = this.u[name];
    delete this.u[name];
  }
  this[type][name] = {
    deps: deps,
    value: value,
    chil: chil
  };
  this.handleDeps(name, deps, (type === 'd'));
  return this;
};

DependentArray.prototype.queue = function (value, deps, name) {
  var chil = [];

  if (typeof deps === 'undefined') {
    deps = [];
  }
  if (typeof deps === 'string') {
    deps = [deps];
  }
  if (typeof name === 'undefined') {
    if (typeof value === 'string') {
      name = value.split('/').pop();
      name = name.substring(0, name.indexOf('.'));
    } else {
      throw new Error("When value isn't a string, name is required");
    }
  }

  if (name in this.u) {
    chil = this.u[name];
    delete this.u[name];
  }
  this.q[name] = {
    deps: deps,
    value: value,
    chil: chil
  };
  this.handleDeps(name, deps);
  return this;
};

DependentArray.prototype.handleDeps = function (name, deps, isdormant) {
  var i;

  for (i = 0; i < deps.length; i++) {
    if (deps[i] in this.d) {
      if (isdormant) {
        if (this.d[deps[i]].deps.indexOf(name) !== -1) {
          throw new Error('Circular Depndencied detected: [' + deps[i] + ', ' + name + ']');
        }
        this.d[deps[i]].chil.push(name);
        continue;
      } else {
        this.q[deps[i]] = this.d[deps[i]];
      }
      delete this.d[deps[i]];
    }
    if (deps[i] in this.q) {
      if (this.q[deps[i]].deps.indexOf(name) !== -1) {
        throw new Error('Circular Depndencied detected: [' + deps[i] + ', ' + name + ']');
      }
      this.q[deps[i]].chil.push(name);
    } else if (deps[i] in this.u) {
      this.u[deps[i]].push(name);
    } else {
      this.u[deps[i]] = [name];
    }
  }
};

DependentArray.prototype.resolve = function () {
  var i;
  this.ret = [];

  if (Object.keys(this.u).length > 0) {
    console.log('We have some unknowns');
  }
  if (Object.keys(this.d).length > 0) {
    console.log('We have some dormants');
  }

  for (i in this.q) {
    if (this.q.hasOwnProperty(i)) {
      this.resolveRecurs(i);
    }
  }
  if (Object.keys(this.q).length > 0) {
    throw new Error('Unresolved queue items: ' + JSON.stringify(Object.keys(this.q)));
  }

  console.log('done');
  return this.ret;
};

DependentArray.prototype.resolveRecurs = function (i) {
  var chil;
  var j;
  if (!(i in this.q)) {
    throw new Error('Unresolved dependency: ' + i);
  }

  while (this.q[i].deps.length > 0) {
    this.resolveRecurs(this.q[i].deps[0]);
  }
  this.ret.push(this.q[i].value);
  chil = this.q[i].chil;
  for (j = 0; j < chil.length; j++) {
    this.q[chil[j]].deps.splice(this.q[chil[j]].deps.indexOf(i), 1);
  }
  delete this.q[i];
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DependentArray;
}
