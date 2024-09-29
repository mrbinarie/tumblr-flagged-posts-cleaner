class App {
    
    constructor() {

        let _this =  this;

        _this.pageCheckFinished = false;

        _this.posts = [];
        
        _this.postsForDelete = [];
        _this.startRemovingPosts = false;

        _this.currentPage = 1;

        $(document).ready(function() {
            if(_this.isUserOnPersonalBlog()) {
                if (confirm("Do give a permission to Emzar for search and remove the flagged posts to all page?")) {
                    _this.loadFinderBot();
                }
            }
        });
    }

    loadFinderBot() {
        console.log('%cEmzar destroyer activated ...', 'color: green; font-weight: bold')
        let _this = this;
        _this.loadLoop(function() {
            let nextBtn = _this.getNextBtn();
            if(nextBtn.length > 0) {
                if(!_this.posts.length && _this.pageCheckFinished == false) {
                    _this.posts = _this.getPosts();
                    if(_this.posts.length > 0) {
                        // console.log(`Emzar start checking 17 posts ... First: ${ $(_this.posts[0]).find('header').text() }`)
                        _this.validatePosts();
                        _this.pageCheckFinished = true;
                    }
                }
                else {
                    if(_this.postsForDelete.length > 0) {
                        if(_this.startRemovingPosts == false) {
                            _this.startRemovingPosts = true;
                            console.log(`%cEmzar start deleting ${_this.postsForDelete.length} flagged posts on page ${_this.currentPage} ...`,
                                'font-wight: bold;')
                            _this.removePosts();
                        }
                    } else {
                        _this.currentPage++;
                        // console.log('Emzar clicked next page ' + _this.currentPage)
                        _this.loadNextPage(nextBtn);
                        _this.pageCheckFinished = false;
                    }
                }
            }
            if(_this.isLastPage()) {
                console.log('%cEmzar removed all flagged posts; here is the edge of the blog.',
                    'color: green; font-weight: bold')
                return true;
            }
        }, 0);
    }

    validatePosts() {
        let _this = this; // if(typeof _this.postsForDelete[index] !== 'undefined') {
        $.each(_this.posts, function(index, post) {
            if(_this.checkIsFlagged( post )) {
                _this.postsForDelete.push(post);
            }
            // else { console.log(`Emzar skipped post | Page: ${_this.currentPage} N:${index} ${_this.getPostSource(post)}`) }
        });
        // if(_this.postsForDelete.length > 0) { console.log(`Emzar found ${_this.postsForDelete.length} flagged posts on page ${_this.currentPage} ...`) }
        _this.posts = [];
    }

    removePosts() {
        let _this = this;
        $.each(_this.postsForDelete, function(index, post) {
            setTimeout(function() {
                // console.log(`\tEmzar removed the post ${index+1}/${_this.postsForDelete.length} from page ${_this.currentPage}`)
                let removeBtn = $(post).find('button[aria-label="Delete"]');
                $(removeBtn).focus();
                $(removeBtn).trigger('click');
    
                // click OK button
                _this.loadLoop(function(countLoop) {
                    let confirmRemoveBtn = $('#glass-container').find('button[aria-label="OK"]');
                    if(confirmRemoveBtn.length > 0) {
                        $(confirmRemoveBtn).trigger('click');
                        console.log(`\tEmzar removed the post ${index+1}/${_this.postsForDelete.length} from page ${_this.currentPage}
                            ${_this.getPostSource(post)}`)

                        // last step, clear everything
                        if (index === _this.postsForDelete.length - 1) {
                            _this.startRemovingPosts = false;
                            _this.postsForDelete.length = [];
                            console.log(`%cEmzar removed all flagged posts from page ${_this.currentPage}.`,
                                'color: green;')
                        }
                        return confirmRemoveBtn;
                    }
                    if(countLoop >= 49) {
                        if (index === _this.postsForDelete.length - 1) {
                            _this.startRemovingPosts = false;
                            _this.postsForDelete.length = [];
                        }
                        console.log(`\t%cEmzar can't remove the post on the page ${_this.currentPage}, so Emzar goes to next. ${_this.getPostSource(post)}`, 
                            'color: red;')
                        return countLoop;
                    }
                });
            }, index * 1500);
        });
    }

    getPosts() {
        let posts = $('main > div > div > div > div').children();
        if(posts.length > 1) {
            $.each(posts, function(i, post) {
                let hasAnyClass = $(post).attr('class') !== undefined && $(post).attr('class') !== '';
                if(hasAnyClass) {
                    posts.splice(i, 1);
                }
            });
            return posts;
        }
        return false;
    }

    getNextBtn() {
        let nextBtn = $(document).find('button[aria-label="Next"]');
        if(nextBtn.length > 0) {
            return nextBtn;
        }
        return false;
    }

    isLastPage() {
        let prevBtn = $(document).find('button[aria-label="Previous"]');
        let nextBtn = $(document).find('button[aria-label="Next"]');
        if(prevBtn.length > 0 && !nextBtn.length) {
            return true;
        }
        return false;
    }

    loadNextPage(nextBtn) {
        $(nextBtn).trigger('click');
    }

    checkIsFlagged(post) {
        let isFlagged = $(post).find('button[aria-label="What does this mean?"]');
        if(isFlagged.length > 0) {
            return true;
        }
        // is media violation image
        // let image = $(post).find('img[loading="lazy"]');
        // if(image.length > 0) {
        //     let srcset = $(image).attr('srcset');
        //     console.log(srcset + "\n")
        //     if(srcset.includes('media_violation')) {
        //         console.log('find media violation')
        //         return true;
        //     }
        // }
        return false;
    }

    getPostSource(post) {
        // link image
        let image_src = '';
        let data_id = '';
        let image = $(post).find('img[loading="lazy"]');
        if(image.length > 0) {
            let srcset = $(image).attr('srcset');
            let srcArray = srcset.split(',');
            image_src = srcArray[ srcArray.length-1 ].trim().split(' ')[0];
        }
        // post link
        let data_id_element = $(post).find('div[data-id]');
        data_id = $(data_id_element).attr('data-id');
        //
        return '\n\t\tImage src: ' + image_src + '\n\t\tSource: https://www.tumblr.com/hornyrocknrolla/' + data_id;
    }

    isUserOnPersonalBlog() {
        let blog_settings = $(document).find('span[data-testid="controlled-popover-wrapper"]');
        if(blog_settings.length > 0) {
            let blog_settings_text = $(blog_settings).text().trim();
            if(blog_settings_text.includes('Blog settings')) {
                return true;
            }
        }
        return false;
    }

    loadLoop(callback, cLoopLimit = 50, countLoop = 0) {
        let _this = this;
        if(callback(countLoop)) {
            return;
        } else {
            countLoop++;
            if(cLoopLimit == 0 || countLoop < cLoopLimit) {
                setTimeout(() => _this.loadLoop(callback, cLoopLimit, countLoop), 100);
            } else {
                console.log('Loop Limit End')
            }
        }
    }
}

let app = new App();