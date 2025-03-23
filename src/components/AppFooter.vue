<!-- src/components/AppFooter.vue -->
<template>
  <div>
    <hr />
    <div class="row">
      <div class="col text-left">
        <small>
          If you found
          <strong
            ><span class="highlight">TRIMCIV</span><strong class="highlight small">target</strong>
            <span class="highlight blue"> predictor</span></strong
          >
          helpful, please cite:
          <i>
            reference.
            <a href="#" target="_blank" rel="noreferrer">
              Title in publication Title in publication Title in publication.
            </a>
            <!-- Nucleic Acids Research. -->
          </i>
        </small>
        <small>
          Are you interested in a research collaboration? Feel free to
          <router-link to="/contact" style="color: #1e90ff"> contact us</router-link>.
        </small>
      </div>
    </div>
    <footer>
      <p style="text-align: right; color: gray">
        <small
          >© 2024 yolo huang
          <a
            href="https://webchem.ncbr.muni.cz/Platform/Home/TermsOfUse"
            target="_blank"
            rel="noreferrer"
          >
            Terms of Use &amp; GDPR
          </a>
        </small>
      </p>
      <br />
    </footer>
  </div>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  justify-content: flex-start;
  // 设置与footer的间距
  .col {
    text-align: left;
    small {
      display: block;
      line-height: 2;
      margin-bottom: 0rem;
      .highlight {
        color: #8c07dd;
        &.small {
          font-size: 75%;
        }
        &.blue {
          color: #1e90ff;
        }
      }
    }
  }
}

footer {
  margin-top: 0rem;
  text-align: right;
  line-height: 2;
}
</style>
