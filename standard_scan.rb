#!/usr/bin/env ruby
# encoding: utf-8
require 'rubygems'

if ARGV.empty?
  puts "which file would you like to scan?"
  local_file = gets.chomp
else
  local_file = ARGV.shift
  puts "Editing: " + local_file.to_s
end

html = File.read(local_file).encode('UTF-8', 'binary', invalid: :replace, undef: :replace, replace: '')

def pdf_cleanup (this)

	regexs = {
		/<!DOCTYPE (.*?)<DIV class="Sect"[\n\s]+>/mi => "", #strip the doctype
		/<div class="toci"([\s\n]+)?><\/div([\s\n]+)?>/mi => "",
		/<div class="toc"([\s\n]+)?><\/div([\s\n]+)?>/mi => "",
		/size=\"[\d+]+\"/i => "",
		/<font\s+>/i => "",
		/<p[\s\n]+>/i => "<p>",
		/<p[\s\n]+ID=["\w\d_]+[\s\n]+>/i => "<p>",
		/<\/p[\s\n]+>/i => "</p>\n",
		/<(\/)?(TR|TD|TABLE)[\s\n]+?>/i => "<\\1\\2>\n",
		/<table[\s\n]+border=0\s+cellspacing=0\s+cellpadding=2[\n\s]+?>/i => "<table border=1 cellspcaing=0 cellpadding=2>",
		/§/ => "&sect;",
		/(”|“)/ => '"',
		/<h\d([\s\n]+)?>/i => "<p><b>",
		/<\/h\d([\s\n]+)?>/i => "</b></p>\n",
        /<h\d[\s\n]+(.*)[\s\n]+>/i => "<p><b>",
        /<\/h\d[\s\n]+(.*)[\s\n]+>/i => "</p></b>\n",
		/<\/Div\n><\/body>\n<\/html>/ => "",
		/<(\/)?DD([\s\n]+)?>/i => "<\\1p>\n",
		/<(\/)?DL([\s\n]+)?>/i => "<\\1ul>\n",
		/<a href=.*?>/i => "",
		/<\/a>/i => "",
		/(–|&#x2013;)/ => "-",
		/<FONT\s+color=\"\#000000\">/i => "</font>",
		/&(n|m)dash;/ => "-",
		/(&(ld|rd)?quo(t)?;)/ => '"',
		/<FONT\s+color=\"#0000FF\">(.*?)<\/font>/mi => "\\1",
		/<TH\s+valign=\"top\"\s+>/i => "<th valign=\"top\">\n",
		/<TD\s+valign=\"top\"\s+>/i => "<td valign=\"top\">\n",
		/<\/TH\s+>/ => "</th>\n",
		/<!DOCTYPE(\s|.)+?(<DIV class=\"Sect\"\s+?>)/ => "",
		/(’|&rsquo;|&lsquo;)/ => "'",
		/™/ => "&#0153;",
		/¶/ => "&para;",
		/©/ => "&#0169;",
		/(?<!<p>)\n&bull;/ => "\n<p>&bull;",
		/(·|•|&#x2022;)/ => "&bull;",
		/<p>\n&bull;/ => "<p>&bull;",
		/<p>(\s)?<\/p>/ => "",
		/<\/I><I>/i => "",
		/<p><\/p>/i => "",
		/&sect;&sect;/i => "&sect;",
		/<p><I> <\/I><\/p>/i => "",
		/<b> <\/b>/i => " ",
		/<b><B>/i => "<b>",
		/>((\d+)\.(\d+)\s-\s)/ => "><a name=\"\\2x\\3\"></a>\\1",
		/>((\d+)\.(\d+)\.(\d+)\s-\s)/ => "><a name=\"\\2x\\3x\\4\"></a>\\1",
		/>((\d+)\.(\d+)\.(\d+)\.(\d+)\s-\s)/ => "><a name=\"\\2x\\3x\\4x\\5\"></a>\\1",
		/>((\d+)\.(\d+)\.(\d+)\.(\d+)\.(\d+)\s-\s)/ => "><a name=\"\\2x\\3x\\4x\\5x\\6\"></a>\\1",
		/>((\d+)\.(\d+)\.(\d+)\.(\d+)\.(\d+)\.(\d+)\s-\s)/ => "><a name=\"\\2x\\3x\\4x\\5x\\6x\\7\"></a>\\1",
                /<\/DIV\n><\/BODY><\/HTML>/im => "",
		/<\/ul>\n<\/ul>\n\n<ul>\n<ul>/im => "",
		/<\/ul>\n\n<ul>/im => "",
		//im => ""

	}

	regexs.each do | regex, replace |

		this.gsub!(regex, replace)

	end
end

def cfr_linking (this)

	regexs = {

		/((?<!>)42\sCFR\s(&sect;|section)?\s(\d+)\.(\d+))([,.;\) ])/i => '<!!uf dp_ecfr42 42cfr\3x\4>\1</a>\5',
		# 42 CFR &sect;424.530(a)(b)(c),   with optional space and sect
		/(?<!>)(42\sCFR\s(&sect;)?\s?(\d+)\.(\d+)\(([\d\w]{1,3})\)\s?\(([\d\w]{1,3})\)\s?\(([\d\w]{1,3})\))([,.;\) ])(?!\(\w\d\))/i => '<!!uf dp_ecfr42 42cfr\3x\4 #42cfr\3x\4z\5-\6-\7>\1</a>\8',
		# 42 CFR &sect;424.530(a)(b),   with optional space and sect
		/(?<!>)(42\sCFR\s(&sect;)?\s?(\d+)\.(\d+)\(([\d\w]{1,3})\)\s?\(([\d\w]{1,3})\))([,.;\) ])(?!\(\w\d\))/i => '<!!uf dp_ecfr42 42cfr\3x\4 #42cfr\3x\4z\5-\6>\1</a>\7',
		# 42 CFR &sect;424.530(a),   with optional space and sect
		/(?<!>)(42\sCFR\s(&sect;)?\s?(\d+)\.(\d+)\(([\d\w]{1,3})\))([,.;\) ])(?!\(\w\d\))/i => '<!!uf dp_ecfr42 42cfr\3x\4 #42cfr\3x\4z\5>\1</a>\6',
		# 42 CFR 410.69, or 42 CFR &sect;424.57
		/(?<!>)(42\sCFR\s(&sect;)?(\d+)\.(\d+))([,.;\) ])(?!\(\w\d\))/ => '<!!uf dp_ecfr42 42cfr\3x\4>\1</a>\5',
		# 42 CFR &sect;410.33 (g) 11
		/(?<!>)(42\sCFR\s&sect;(\d+)\.(\d+)\s\(([\d\w]{1,3})\)\s([\d\w]{1,3}))(\s-\s)/ => '<!!uf dp_ecfr42 42cfr\2x\3 #42cfr\2x\3z\4\-\5>\1</a>',
		# 42 CFR &sect;424.57(d)(3)(ii)
		/(?<!>)(42\sCFR\s&sect;(\d+)\.(\d+)\(([\d\w]{1,3})\)\(([\d\w]{1,3})\)\(([\d\w]{1,3})\))/ => '<!!uf dp_ecfr42 42cfr\2x\3 #42cfr\2x\3z\4\-\5\-\6>\1</a>',
		# 42 CFR 410.27(g),
		/(?<!>)(42\sCFR\s(&sect;\s)?(\d+)\.(\d+)\(([\d\w]{1,3})\))([,.;\) ])(?!\()/ => '<!!uf dp_ecfr42 42cfr\3x\4 #42cfr\3x\4z\5>\1</a>\7',

		# 42 CFR 410.27(g)(1),
		/(?<!>)(42\sCFR\s(\d+)\.(\d+)\(([\d\w]{1,3})\)\(([\d\w]{1,3})\))([,.; ])/ => '<!!uf dp_ecfr42 42cfr\2x\3 #42cfr\2x\3z\4-\5>\1</a>\6',

		# 42 CFR 482.22(c)(5)(ii).
		/(?<![R|>])(42\sCFR\s(&sect;)?(4\d+).(\d+)\s?\(([\d\w]{1,3})\)\(([\d\w]{1,3})\)\(([\d\w]{1,3})\))([ ,.;])/ => '<!!uf dp_ecfr42 42cfr\3x\4 #42cfr\3x\4z\5-\6-\7>\1</a>\8',

		# 42 C.F.R. &sect; 424.57(d)(5)(i)(A)
		/(?<!>)(42\sC\.?F\.?R\.?\s&sect;\s(\d+)\.(\d+)\(([\d\w]{1,3})\)\(([\d\w]{1,3})\)\(([\d\w]{1,3})\)\(([\d\w]{1,3})\))([ ,.;])/ => '<!!uf dp_ecfr42 42cfr\2x\3 #42cfr\2x\3z\4-\5-\6-\7>\1</a>',

		# 42 CFR &sect; 424.530(a),
		/(?<!>)(42\sCFR\s?&sect;\s(\d+)\.(\d+)\(([\d\w]{1,3})\))([ ,.;])/ => '<!!uf dp_ecfr42 42cfr\2x\3 #42cfr\2x\3z\4>\1</a>\6',

		# 42 CFR &sect; 424.57(d)(3)
		/(?<!>)(42\sCFR\s&sect;\s?(\d+)\.(\d+)\(([\d\w]{1,3})\)\(([\d\w]{1,3})\))/ => '<!!uf dp_ecfr42 42cfr\2x\3 #42cfr\2x\3z\4-\5>\1</a>',

		# &sect;424.502
		/(?<![R|>])(\s&sect;(4\d+).(\d+))([ ,.;])/ => '<!!uf dp_ecfr42 42cfr4\2x\3>\1</a>\4',

		# &sect;424.57(d),
		/(?<!CFR)(\s&sect;\s?(4\d+)\.(\d+)\(([\w\d])\))(?!\()([,.; ])/ => '<!!uf dp_ecfr42 42cfr4\2x\3 #42cfr4\2x\3z\4>\1</a>\5',

		# &sect;424.57(d)(3)
		/(?<![R>])(\s?&sect;(4\d+)\.(\d+)\(([\d\w]{1,3})\)\(([\d\w]{1,3})\))([\s.,;<])/ => '<!!uf dp_ecfr42 42cfr\2x\3 #42cfr\2x\3z\4-\5>\1</a>\6',

		# &sect;482.22(c)(5)(i)
		/(?<![R>])(\s?&sect;(4\d+)\.(\d+)\(([\d\w]{1,3})\)\(([\d\w]{1,3})\)\(([\d\w]{1,3})\))([\s.,;<\)])/ => '<!!uf dp_ecfr42 42cfr\2x\3 #42cfr\2x\3z\4-\5-\6>\1</a>\7',

		# <p>&sect;424.57(d)
		/(<p>)(\s?&sect;\s?(4\d+)\.(\d+)\(([\d\w]{1,3})\))(?![<|\(])/ => '<p><!!uf dp_ecfr42 42cfr4\3x\4 #42cfr4\3x\4z\5>\2</a>',

		# uidelines:  &sect;416.50<FONT color="#FF0000"><I>(c)
		/((?<![R>])(\s?&sect;(4\d+)\.(\d+))<FONT color="#FF0000"><I>\(([\d\w]{1,3})\))([\s.,;<])/ => '<!!uf dp_ecfr42 42cfr4\2x\4 #42cfr4\3x\4z\5>\2</a>',

		# <p>&sect;416.50<FONT color="#FF0000"><I>(f)</I></font>
		/((<(p|b)>)(\s?&sect;4(\d+)\.(\d+))<FONT color="#FF0000"><I>\(([\d\w]{1,3})\))([\s.,;<])/ => '<!!uf dp_ecfr42 42cfr4\5x\6 #42cfr4\5x\6z\7>\1</a>',

		# 42 CFR 489.20(u)(1)
		/((?<![R>])42\sC(\.)?F(\.)?R(\.)?\s(\d+)\.(\d+)\(([\d\w]{1,3})\)\(([\d\w]{1,3})\))([\s.,;<])/ => '<!!uf dp_ecfr42 42cfr4\5x\6 #42cfr4\5x\6z\7-\8>\1</a>\9'

	}

	regexs.each do | regex, replace |

		this.gsub!(regex, replace)

	end
end
$local_file = local_file

def disclaimer (this)
	regex = /(\(Rev.\s?\d+,.*<\/p>)/i


	puts "Which UID should we use for the disclaimer link?"
	#uid = gets.chomp
        doc = $local_file.to_s.sub(/\.html?/, '').downcase

        #find the uid by the file name
        collection_identifiyer = doc.sub(/r\d+/i, '')

        case collection_identifiyer
          when "cp"
            collection = "mre_pm_100_04"
          when "pi"
            collection = "mr_pm_100_08"
          when "otn"
            collection = "mre_pm_100_20"
          when "bp"
            collection = "mre_pm_100_02"
          when "soma"
            collection = "mre_pm_100_07"
          when "demo"
            collection = "mre_mr_pm_100_19"
          when "msp"
            collection = "mre_mr_mspm"
          when "ncd"
            collection = "mre_pm_100_03"
          when "gi"
            collection = "mr_pm_100_01"
          when "mcm"
            collection = "mr_pm_100_16"
          when "fm"
            collection = "mr_pm_100_6"
          else
            puts "Which Collection should we use for the disclaimer link?"
            collection = gets.chomp
        end

        uid = collection.gsub(/_/, '').downcase + doc
        puts "uid: " + uid

	replace = "\\1\n</b><font color=\"#000000\"><p><i>Note:</i> Minor inconsistencies may occur during PDF conversion process. You can also view this document <!!uf #{collection} #{uid}>in PDF.</a></p></font>"


	this.gsub!(regex, replace)
end

pdf_cleanup(html)

cfr_linking(html)

disclaimer(html)

writefile = "edited_" + local_file

my_local_file = open(writefile , "w")

my_local_file.write(html)
my_local_file.close

puts "wrote the file: " + writefile
