<?php
/**
 * The template for displaying all single posts
 *
 * @package Narayane_Sena
 */

get_header(); ?>

<div class="container" style="margin-top: 50px;">
    <?php
    while (have_posts()) : the_post();
    ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class('card'); ?>>
            <div class="card-header">
                <h1><?php the_title(); ?></h1>
                <p style="color: #6c757d; margin: 10px 0 0; font-size: 14px;">
                    Posted on <?php echo get_the_date(); ?> by <?php the_author(); ?>
                </p>
            </div>
            <div style="padding: 20px;">
                <?php the_content(); ?>
            </div>
        </article>
        
        <?php
        // If comments are open or we have at least one comment, load up the comment template.
        if (comments_open() || get_comments_number()) :
            comments_template();
        endif;
        ?>
    <?php
    endwhile;
    ?>
</div>

<?php get_footer(); ?>
