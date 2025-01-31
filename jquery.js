// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

// Extend JQuery by adding a showModal() method (mimic-ing the corresponding
// method in the standard DOM model).
$.fn.extend({showModal: function()
                        {
                          return this.each(function()
                                           {
                                             if(this.tagName === "DIALOG")
                                             {
                                               this.showModal();
                                             }
                                           });
                        }
            });

// Extend JQuery by adding a close() method (mimic-ing the corresponding method
// in the standard DOM model).
$.fn.extend({close: function()
                    {
                      return this.each(function()
                                       {
                                         if(this.tagName === "DIALOG")
                                         {
                                           this.close();
                                         }
                                       });
                    }
            });