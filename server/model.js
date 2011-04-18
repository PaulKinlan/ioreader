/*
  A Basic data holder
*/
exports.CategoryData = function(id, name) {
  this.id = id; 
  this.name = name;
  this.articles = [];

  /*
   Adds an item in to the category
  */
  this.addItem = function(item) {
    this.articles.push(item);
  };
};

/*
  A data item in the category.
*/
exports.CategoryItem = function(id, title, shortDescription, category) {
  this.id = encodeURIComponent(id);
  this.title = title;
  this.shortDescription = shortDescription;
  this.thumbnail;
  this.categoryId = category.id;
  this.state = "";
  this.imageState = "";
  this.url = function () { return "reader/" + categoryId + "/" + this.id + ".html"; }; 
  this.dataUrl = function () { return "reader/" + categoryId + "/" + this.id + ".json"; };
};
