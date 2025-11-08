<?php
/**
 * The template for displaying all pages
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
            </div>
            <div style="padding: 20px;">
                <?php the_content(); ?>
            </div>
        </article>
    <?php
    endwhile;
    ?>
</div>

<?php get_footer(); ?>
